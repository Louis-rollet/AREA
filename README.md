This guide will help you set up and run the project, which consists of two parts: the frontend and the backend. You can launch each part using Docker or their respective dedicated tools.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Using Docker](#using-docker)
3. [Using Dedicated Tools](#using-dedicated-tools)
   - [Backend with Yarn](#backend-with-yarn)
   - [Frontend with Flutter](#frontend-with-flutter)
4. [Common Issues](#common-issues)

## Prerequisites

Ensure you have the following installed on your system:

- [Docker/Docker-Compose](https://docs.docker.com/get-docker/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (for backend setup without Docker)
- [Flutter](https://docs.flutter.dev/get-started/install) (for frontend setup without Docker)

## Using Docker

Build and run the frontend container:
   ```bash
   docker-compose up --build
   ```
The front-end and back-end should now be running. Access it by navigating to the specified port 8080 for back-end and 8081 for front-end in your browser (refer to your `docker-compose.yml` for the correct port).

## Using Dedicated Tools

### Backend with Yarn

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the dependencies:
   ```bash
   yarn install
   ```

3. Run the backend:
   ```bash
   yarn start
   ```

4. The backend will now be running and accessible on the port configured in your project.

### Frontend with Flutter

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the dependencies:
   ```bash
   flutter pub get
   ```

3. Run the frontend application:
   ```bash
   flutter run
   ```

4. The frontend should now be accessible. If you're running on a browser, it will automatically open the browser with the correct URL.

## Common Issues

- **Docker Compose Fails:** Ensure Docker is running and that the ports in your `docker-compose.yml` files do not conflict with other services on your machine.
- **Yarn/Flutter Issues:** Ensure you have the correct versions of Yarn and Flutter installed by checking the version with:
  ```bash
  yarn --version
  flutter --version
  ```

For further help, refer to the official documentation of [Docker](https://docs.docker.com/), [Yarn](https://classic.yarnpkg.com/), and [Flutter](https://docs.flutter.dev).

---

This setup guide provides the essential steps to run the project in either Docker or with dedicated tools, helping you choose the most convenient method for your environment.
