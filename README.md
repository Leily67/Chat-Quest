<img src="https://i.ibb.co/8KzXd83/chat.png" alt="CATQUEST_LOGO" width="300" height=300 align="right"/>

# Welcome to Chat Quest :rocket:

This IRC chat project was carried out by 3 students from Epitech Strasbourg, using the MERN stack (MongoDB, Express.js, React, Node.js).

## Table of contents
1. [Prerequisites](#prerequisites)
3. [Setup and configuration](#setup-and-configuration)
4. [Run the project](#running-the-project)
7. [Technologies](#technologies)
8. [Authors](#authors)

## Prerequisites

- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/)

## Setup and configuration

### Clone the repository

```bash
$ git clone git@github.com:EpitechMscProPromo2026/T-JSF-600-STG_11.git
$ bash setup.sh # If you want to configure everything automatically
```

### Manual setup

In the two folders (backend and frontend), you will need to install the javascript dependencies and configure the environments variables.

#### Install the dependencies

```bash
$ pnpm install
```

#### Configure the environment variables

```bash
$ cp .env.example .env
```

Change the values of the environment variables in the `.env` file.

#### Generate the application secret key

Only in the backend, generate the app keys using the following command:

```bash
$ pnpm run secret:generate
```

### Run the tests

```bash
$ cd backend
$ pnpm test
```

## Running the project

### Start the server and client

```bash
$ pnpm dev
```

## Bonus

- Dark/light Theme
- Send Vocal
- Send Emoji
- Send Image
- Reaction to messages
- Edit your messages
- PWA

## Technologies

![](https://img.shields.io/badge/Express-ED8B00?style=for-the-badge&logo=express&color=20232a)
![](https://img.shields.io/badge/mongodb-ED8B00?style=for-the-badge&logo=mongodb&color=20232a)
![](https://img.shields.io/badge/TypeScript-ED8B00?style=for-the-badge&logo=typescript&color=20232a)
![](https://img.shields.io/badge/next-ED8B00?style=for-the-badge&logo=next.js&color=20232a)
![](https://img.shields.io/badge/pnpm-ED8B00?style=for-the-badge&logo=pnpm&color=20232a)

## Authors

- [@AlxisHenry](https://github.com/AlxisHenry)
- [@Flaironne](https://github.com/Flaironne)
- [@Leily67](https://github.com/Leily67)
