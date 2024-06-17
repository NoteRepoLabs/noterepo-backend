<img src="./.github/banner.svg" alt="RepoBanner" />

Web server for the NoteRepo web client written with NestJS and Typescript.

## Developer Notes

We're actively looking for contributors as we're only two engineers working on it at the moment. So if you know NestJS and optionally Typescript, feel free to submit pull requests, they're always welcome!

## Building the client

To get started, git clone the repository and cd into it.

```sh
git clone https://github.com/NoteRepoLabs/noterepo-backend.git

cd noterepo-backend
```

Then install the dependencies using `yarn`

```sh
$ yarn install
```

## Environment Configuration

To run the server, create a `.env` file in the root of the project using the [`.env.example`](https://github.com/NoteRepoLabs/noterepo-backend/blob/docs/update-docs/.env.example) file as a template.

## Running the app

```sh
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Running Test

```sh
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## API Documentation

This project uses Swagger to document its APIs. Follow the steps below to view the Swagger documentation.

1. **Start the Server**: Make sure your server is running. You can do this by using the following command:

```sh
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

2. **Access Swagger UI**: Once the server is running, open your web browser and navigate to:

```sh
http://localhost:yourport/api
```

Replace `yourport` with the port number your server is running on (e.g., `3000`, `8080`, etc.).

3. **Explore the API Endpoints**: You should see the Swagger UI with all available API endpoints. You can use this interface to explore and test the APIs.

## Bug Reports

You can report any bugs you find using the `issues` tab if it's not already present and being fixed.

## Additional Information

- The project uses a PostgreSQL database with [Prisma ORM](https://www.prisma.io/).
- It incorporates a search engine with [MeiliSearch](https://meilisearch.com).
- Redis is utilized for rate limiting.
- [Cloudinary](https://cloudinary.com) is used for storage.
- [Mailgun](https://mailgun.com) is used to send emails.
- Swagger for api documention
