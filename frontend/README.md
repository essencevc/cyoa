# Introduction

This is the frontend for the CYOA website.

## Environment Variables

The following environment variables are required:

```
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
TURSO_CONNECTION_URL=
TURSO_AUTH_TOKEN=
```

## Database

The database is hosted on [Turso](https://turso.tech/) which provides a SQLite-compatible database using `libsql`. To get started, you can use the following command to generate the database schema:

```bash
npx drizzle-kit generate
```

Then, you can run the following command to push the changes to the database:

```bash
npx drizzle-kit migrate
```
