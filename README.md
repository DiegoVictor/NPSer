# NPSer
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/DiegoVictor/npser/CI?logo=github&style=flat-square)](https://github.com/DiegoVictor/npser/actions)
[![eslint](https://img.shields.io/badge/eslint-7.20.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-26.6.3-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/npser?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/npser)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/npser/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=NPSer&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2FNPSer%2Fmaster%2FInsomnia_2021-02-25.json)

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [SQLite](#sqlite)
      * [Migrations](#migrations)
    * [.env](#env)
* [Usage](#usage)
  * [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application use just one database: [SQLite](https://www.sqlite.org/index.html).

### SQLite
Store all users and surveys. For more information to how to setup your database see:
* [typeorm](https://typeorm.io/#/using-ormconfig)
> You can find the application's `ormconfig.json` file in the root folder.

#### Migrations
Remember to run the database migrations:
```
$ yarn ts-node-dev ./node_modules/typeorm/cli.js migration:run
```
Or:
```
$ yarn typeorm migration:run
```
> See more information on [TypeORM Migrations](https://typeorm.io/#/migrations).

### .env
In this file you may configure app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|URL_MAIL|Url to send the NPS answer|`http://localhost:3333/answers`
|PORT|Port number where the app will run.|`3333`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/npser#errors-reference`

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "User already exists",
  "code": 140,
  "docs": "https://github.com/DiegoVictor/npser#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom).
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|140|User already exists|The provided email is already registered by another user.
|240|User does not exists|The provided email was not found.
|241|Survey does not exists|The provided survey id does not references an existing registry in the database.
|242|Answer not found|A survey was not sent to this user.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/surveys
```

## Routes
|route|HTTP Method|params|description
|:---|:---:|:---:|:---:
|`/users`|POST|Body with user `name` and `email`.|Create a new user
|`/surveys`|GET| - |Lists surveys.
|`/surveys`|POST|Body with user `title` and `description`.|Create a new survey
|`/send_mail`|POST|Body with user `email` and a `survey_id`.|Send the NPS to provided user
|`/answers`|GET| - |List survey answers
|`/answers/:value`|GET|survey `value` url parameter and survey user `id` query parameter.|Set user's avaliation to one survey
|`/nps/:survey_id`|GET|`survey_id` url parameter.|Show survey NPS

### Requests
* `POST /users`

Request body:
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com"
}
```

* `POST /survey`

Request body:
```json
{
  "title": "Internal Directives Engineer",
  "description": "Cupiditate modi occaecati aut?"
}
```

* `POST /send_mail`

Request body:
```json
{
  "email": "johndoe@example.com",
  "survey_id": "388017f8-dfdf-4681-9112-e1bb0de009ec"
}
```

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
