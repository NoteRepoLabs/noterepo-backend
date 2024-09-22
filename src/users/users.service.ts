import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "../prisma/prisma.service";
import { ForgetPasswordDto } from "./dto/forget-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { generateResetPasswordLink } from "../utils/generateLinks/generateResetPasswordLink";
import * as bcrypt from "bcrypt";
import { EmailService } from "../email/email.service";
import { v4 as uuid } from "uuid";
import { CloudinaryService } from "../storage/cloudinary/cloudinary.service";
import { VerificationTokenDto } from "./dto/verification.dto";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly email: EmailService,
		private readonly cloudinary: CloudinaryService,
	) {}

	async createUser(user: CreateUserDto) {
		return await this.prisma.user.create({
			data: { email: user.email, password: user.password },
		});
	}

	async findUserById(userId: string) {
		return await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
	}

	async findUserByEmail(email: string) {
		return await this.prisma.user.findUnique({
			where: { email: email },
		});
	}

	async findUserByUsername(username: string) {
		return await this.prisma.user.findUnique({
			where: { username },
		});
	}

	//Development only
	async getAllUsers() {
		const user = await this.prisma.user.findMany();

		return user;
	}

	async findUserProfile(userId: string) {
		return await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				username: true,
				bio: true,
				Repo: { where: { isPublic: true } },
			},
		});
	}

	async updateUser(userId: string, updateUserDto: UpdateUserDto) {
		return await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: updateUserDto,
		});
	}

	async updateUserBio(userId: string, bio: string) {
		return await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: { bio },
		});
	}

	async verifyUser(verificationToken: VerificationTokenDto) {
		return await this.prisma.user.update({
			where: {
				id: verificationToken.userId,
			},
			data: { isVerified: true },
		});
	}

	async forgetPassword({ email }: ForgetPasswordDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: email.toLowerCase(),
			},
		});

		if (!user) {
			throw new NotFoundException("User with email not found.");
		}

		const isToken = await this.prisma.resetPassword.findUnique({
			where: { userId: user.id },
		});

		let resetPasswordToken: string;

		//If token is already in db, reuse it, else create a new one
		if (isToken) {
			resetPasswordToken = isToken.token;
		} else {
			//Create a reset token
			const newPasswordToken = await this.prisma.resetPassword.create({
				data: { token: uuid(), userId: user.id },
			});

			resetPasswordToken = newPasswordToken.token;
		}

		const link = generateResetPasswordLink(resetPasswordToken);

		await this.email.sendResetPasswordMail(email, link);

		return `Reset password mail has be sent to ${email.replace(/(?<=^.{3})\w+/g, (match) => "*".repeat(match.length))}`;
	}

	async resetPassword(
		token: string,
		{ password, confirmPassword }: ResetPasswordDto,
	) {
		const resetPassword = await this.prisma.resetPassword.findUnique({
			where: {
				token,
			},
		});

		//If no reset password link
		if (!resetPassword) {
			throw new NotFoundException("Can't reset password, link expired");
		}

		if (password !== confirmPassword) {
			throw new BadRequestException(
				"Password does match with confirm password",
			);
		}

		//Hash new password
		const newPassword = await bcrypt.hash(password, 10);

		const updatedUser = this.prisma.user.update({
			where: { id: resetPassword.userId },
			data: { password: newPassword },
		});

		//Delete reset token from db
		await this.prisma.resetPassword.delete({ where: { id: resetPassword.id } });

		return updatedUser;
	}

	//Removes a user
	async remove(id: string) {
		const user = await this.prisma.user.findUnique({ where: { id: id } });

		if (!user) {
			throw new NotFoundException("User not found");
		}

		const resetToken = await this.prisma.resetPassword.findUnique({
			where: { userId: id },
		});

		if (resetToken) {
			await this.prisma.resetPassword.delete({ where: { userId: id } });
		}

		const verificationToken = await this.prisma.verification.findUnique({
			where: { userId: id },
		});

		if (verificationToken) {
			await this.prisma.verification.delete({ where: { userId: id } });
		}

		const repos = await this.prisma.repo.findMany({ where: { userId: id } });

		if (repos.length > 0) {
			const repoIds: string[] = [];

			repos.forEach((repo) => repoIds.push(repo.id));

			const files = await this.prisma.file.findMany({
				where: { repoId: { in: repoIds } },
			});

			if (files.length > 0) {
				const fileNames: string[] = [];

				files.forEach((file) => fileNames.push(file.publicName));

				// Delete user files
				await this.cloudinary.deleteFilesFromStorage(fileNames);

				// Delete User folder
				await this.cloudinary.deleteUserFolderFromStorage(user.username);

				console.log("User files and folder deleted");
			}
		}

		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id: id },
				data: { Repo: { deleteMany: {} } },
				include: { Repo: true },
			}),
			this.prisma.user.delete({ where: { id: id } }),
		]);
		return;
	}

	//Only for prelaunch development purposes and should not be touched.
	async removeAllUsers() {
		await this.prisma.$transaction([
			this.prisma.resetPassword.deleteMany({}),
			this.prisma.verification.deleteMany({}),
			this.prisma.user.deleteMany({}),
		]);
		return;
	}
}
