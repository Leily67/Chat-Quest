# Chat Quest Backend :rocket:

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Setup and configuration](#setup-and-configuration)
3. [Run the project](#running-the-project)
4. [Technologies](#technologies)
5. [Authors](#authors)

## Prerequisites

- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/)

## Setup and configuration

### Clone the repository

```bash
$ git clone git@github.com:EpitechMscProPromo2026/T-JSF-600-STG_11.git
$ cd T-JSF-600-STG_11/backend
```

### Install the dependencies

```bash
$ pnpm install
```

### Configure the environment variables

```bash
$ cp .env.example .env
```

Change the values of the environment variables in the `.env` file.

### Generate the application keys

This command will generate the application key and store them in the `.env` file. It will also generate the secret key for the JWT.

```bash
$ pnpm run key:generate
```

### Run the tests

```bash
$ pnpm test
```

## Running the project

### Start the server

```bash
$ pnpm dev
```

All logs will be displayed in the console, and also in the `logs` directory.

## Technologies

![](https://img.shields.io/badge/Express-ED8B00?style=for-the-badge&logo=express&color=20232a)
![](https://img.shields.io/badge/mongodb-ED8B00?style=for-the-badge&logo=mongodb&color=20232a)
![](https://img.shields.io/badge/TypeScript-ED8B00?style=for-the-badge&logo=typescript&color=20232a)
![](https://img.shields.io/badge/jest-ED8B00?style=for-the-badge&logo=jest&color=20232a)
![](https://img.shields.io/badge/pnpm-ED8B00?style=for-the-badge&logo=pnpm&color=20232a)

## Authors

- [@AlxisHenry](https://github.com/AlxisHenry)
