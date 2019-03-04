## Environment

Assuming you have a working NodeJS environment and Yarn installed.

## Installation

Fetch all dependencies of `npm`:

```
$ yarn
```

Generate & modify environment configuration file, make sure `NODE_ENV` is `development` or `production`.

```
$ mv .env.example .env
$ vim .env
```

## Development

Develop with hot reload

```
$ yarn dev
```

## Production

Run build

```
$ yarn build
```

Start express server:

```
$ yarn start
```

## Docker build

First, you need a docker environment installed.

Build image:

```
$ docker build -t fptu-fe .
```

Run image:

```
$ docker run -dit -p 3000:3000 fptu-fe:latest
```
