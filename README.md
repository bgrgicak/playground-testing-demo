# Building Automated Tests with WordPress Playground

This repository contains the code and instructions for the workshop "Building Automated Tests with WordPress Playground" for WordCamp EU 2025.

## Workshop description:

The goal of this workshop is to show how easy it is to start testing WordPress projects and enable participants to implement tests in their own projects.
In the workshop we will write integration and end-to-end tests for a typical WordPress plugin.
We will run tests using WordPress Playground, so they can run inside the WordPress context, each test can run on a differently configured site, and we can test the project using both PHP and HTTP requests.
To start we will fork a plugin from GitHub and learn how to run it locally using the Playground CLI. After that, we will implement integration and end-to-end tests for our plugin using Playground.
Once we have all tests working we will add a GitHub action to run these tests on every commit in GitHub.

If you want to see the final result, you can check the `main` branch, or you can check the `start` branch, which is the starting point for the workshop.

## Requirements:

You will need `Node.js 20.18.3` with `npm 11.2.0` or higher on your machine.
It's possible to install it using [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm#installing-and-updating) or install Node.js from [Node.js website](https://nodejs.org/en/download/).

Optionally [Git](https://git-scm.com/downloads), but if you don't want to use Git, you can download the project as a zip file, or from a USB drive that will be provided during the workshop.

## Development setup:

1. Clone the repository:

```bash
git clone -b start https://github.com/bgrgicak/playground-testing-demo
```

2. Setup the Node.js environment:

```bash
nvm install
nvm use
```

3. Install the dependencies:

```bash
npm ci
```

3.1 Install Playwright:

```bash
npx playwright install --with-deps
```

4. Run the WordPress site

```bash
npx @wp-playground/cli server --mount=.:/wordpress/wp-content/plugins/
```

5. Run the tests:

```bash
npm run test
```

5.1 Run integration tests:

```bash
npm run test:integration
```

5.2 Run end-to-end tests:

```bash
npm run test:e2e
```

## What are we building?

### [Local development server](https://bero.dev/building-automated-tests-with-wordpress-playground/#cli)

- [ ] Run the local development server using Playground CLI
  - [ ] Mount the plugin code in the WordPress site
  - [ ] Configure the WordPress site using a Blueprint

### [Integration tests](https://bero.dev/building-automated-tests-with-wordpress-playground/#integration)

- [ ] Check if the plugin is active
- [ ] Rest API endpoint `POST` `/wp-json/PTD/v1/message`
  - [ ] Confirm the API endpoint fails when not authenticated
  - [ ] Confirm the API endpoint returns expected response when authenticated
  - [ ] Confirm the API endpoint saves the message to the database

### [End-to-end tests](https://bero.dev/building-automated-tests-with-wordpress-playground/#e2e)

- [ ] Admin page
  - [ ] Check if `/wp-admin/admin.php?page=workshop-tests` page loads
  - [ ] Check if the message is displayed after submitting the form
  - [ ] Check if the message is persisted after a page reload

### GitHub Actions

- [ ] Run tests on every commit
