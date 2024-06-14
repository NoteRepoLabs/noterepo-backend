<img src="./github/banner.svg" alt="RepoBanner" />

Web server for the NoteRepo web client written with NestJS and Typescript.

## Developer Notes

We're actively looking for contributors as we're only two engineers working on it at the moment. So if you know NestJS and optionally Typescript, feel free to submit pull requests, they're always welcome!

## Building the client

To get started, git clone the repository and cd into it.

```sh
git clone https://github.com/NoteRepoLabs/noterepo-backend.git

cd noterepo-backend
```

Then install the dependencies using `npm`

```sh
$ yarn install
```

## Environment Configuration

To run the server, create a `.env` file in the root of the project using the `.env.example` file as a template.

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

## Bug Reports

You can report any bugs you find using the `issues` tab if it's not already present and being fixed.

## Additional Information

- The project uses a PostgreSQL database with [Prisma ORM](https://www.prisma.io/).
- It incorporates a search engine with [MeiliSearch](https://meilisearch.com).
- Redis is utilized for rate limiting.
- [Cloudinary](https://cloudinary.com) is used for storage.
- [Mailgun](https://mailgun.com) is used to send emails.
