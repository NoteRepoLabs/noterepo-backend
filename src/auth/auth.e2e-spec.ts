import { INestApplication } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "../jwt/jwt.service";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma/prisma.service";
import { postgresClient, prismaService } from "../../test/setupTests.e2e";
import * as request from "supertest";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { CloudinaryService } from "../storage/cloudinary/cloudinary.service";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { emailService } from "../email/email.mock";
import axios from "axios";
import { extractLinkFromHtml } from "../utils/extractLinkfromHtml";

async function getEndpoint(url: string) {
	const endpoint = url.replace(/^https?:\/\/[^\/]+\/api\/v1/, "");
	return endpoint;
}

let mailpitContainer: StartedTestContainer;
describe("AuthController", () => {
	let controller: AuthController;
	let app: INestApplication;

	beforeAll(async () => {
		process.env.MEILISEARCH_HOST = "http://localhost:7700";

		// Start Mailpit for capturing mails locally
		mailpitContainer = await new GenericContainer("axllent/mailpit")
			.withName("mailpit")
			.withExposedPorts(
				{ container: 8025, host: 8025 },
				{ container: 1025, host: 1025 },
			)
			.withStartupTimeout(120000)
			.start();

		// Get the mapped ports for accessing the services
		const uiPort = mailpitContainer.getMappedPort(8025);
		const smtpPort = mailpitContainer.getMappedPort(1025);

		console.log(`Mailpit UI is running on port ${uiPort}`);
		console.log(`Mailpit SMTP is running on port ${smtpPort}`);
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				AuthService,
				JwtService,
				PrismaService,
				EmailService,
				UsersService,
				CloudinaryService,
			],
		})
			.overrideProvider(PrismaService)
			.useValue(prismaService)
			.overrideProvider(EmailService)
			.useClass(emailService)
			.compile();

		controller = module.get<AuthController>(AuthController);

		app = module.createNestApplication();
		await app.init();
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("Should signup /auth/sign-up (POST)", async () => {
		const userRequest = { email: "manuel234@gmail.com", password: "anonymous" };

		const response = await request(app.getHttpServer())
			.post("/auth/sign-up")
			.send(userRequest)
			.expect(201);

		expect(response.body.email).toBe(userRequest.email);
		expect(response.body.role).toBe("USER");
		expect(response.body.isVerified).toBeFalsy();
		expect(response.body.username).toBeNull();
		expect(response.body.password).toBeUndefined();
		expect(response.body.refresh_token).toBeNull();
		expect(response.body.access_token).toBeUndefined();
		expect(response.body.updatedAt).toBeUndefined();
	});

	it("Should not sign-in /auth/sign-in", async () => {
		const userRequest = { email: "manuel234@gmail.com", password: "anonymous" };

		const response = await request(app.getHttpServer())
			.post("/auth/sign-in")
			.send(userRequest)
			.expect(401);

		expect(response.body).toBeDefined();
		expect(response.body.message).toBe(
			"Your account is not verified, an email as be sent to man******@gmail.com",
		);
		expect(response.body.error).toBe("Unauthorized");
		expect(response.body.statusCode).toBe(401);
	});

	it("should verify user account", async () => {
		// Ensure email is sent and Mailpit captures it
		await new Promise((resolve) => setTimeout(resolve, 1000));

		//Get verification mail html
		const verificationMailHtml = await axios.get(
			"http://localhost:8025/view/latest.html",
		);

		//Parse the html to get the link
		const verifyLink = extractLinkFromHtml(verificationMailHtml.data);

		const endpoint = await getEndpoint(verifyLink);

		await request(app.getHttpServer()).get(endpoint).expect(302);

		// Query the database for the newly verified user
		const result = await postgresClient.query('SELECT * FROM "public"."User"');

		expect(result.rows[0].email).toBeDefined();
		expect(result.rows[0].role).toEqual("USER");
		expect(result.rows[0].isVerified).toBeTruthy();
		expect(result.rows[0].username).toBeNull();
	});

	it("Should redirect user to set username /auth/sign-in", async () => {
		const userRequest = { email: "manuel234@gmail.com", password: "anonymous" };

		await request(app.getHttpServer())
			.post("/auth/sign-in")
			.send(userRequest)
			.expect(302);
	});

	it("Should set username /auth/setInitialUsername", async () => {
		try {
			const userRequest = { username: "anonymous" };

			// Query the database for the user
			const result = await postgresClient.query(
				'SELECT * FROM "public"."User"',
			);

			const response = await request(app.getHttpServer())
				.post(`/auth/setInitialUsername/${result.rows[0].id}`)
				.send(userRequest)
				.expect(201);

			expect(response.body.email).toBeDefined();
			expect(response.body.role).toEqual("USER");
			expect(response.body.isVerified).toBeTruthy();
			expect(response.body.refresh_token).toBeDefined();
			expect(response.body.access_token).toBeDefined();
			expect(response.body.username).toBe(userRequest.username);
		} catch (error) {
			// Rollback the transaction in case of an error
			await postgresClient.query("ROLLBACK");
			throw error;
		}
	});

	it("Should signin user /auth/sign-in (POST)", async () => {
		const userRequest = { email: "manuel234@gmail.com", password: "anonymous" };

		const response = await request(app.getHttpServer())
			.post("/auth/sign-in")
			.send(userRequest)
			.expect(200);

		expect(response.body.email).toBe(userRequest.email);
		expect(response.body.role).toBe("USER");
		expect(response.body.isVerified).toBeTruthy();
		expect(response.body.username).toBeDefined();
		expect(response.body.password).toBeUndefined();
		expect(response.body.refresh_token).toBeDefined();
		expect(response.body.access_token).toBeDefined();
		expect(response.body.updatedAt).toBeUndefined();
	});

	afterAll(async () => {
		if (mailpitContainer) {
			await mailpitContainer.stop();
			console.log("test db stopped...");
		}
		await app.close();
	});
});

jest.setTimeout(200000);
