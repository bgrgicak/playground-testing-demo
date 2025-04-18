# Building Automated Tests with WordPress Playground

This repository contains the code and instructions for the workshop "Building Automated Tests with WordPress Playground" for WordCamp EU 2025.

## Workshop description:

The goal of this workshop is to show how easy it is to start testing WordPress projects and enable participants to implement tests in their own projects.
In the workshop we will write integration and end-to-end tests for a typical WordPress plugin.
We will run tests using WordPress Playground, so they can run inside the WordPress context, each test can run on a differently configured site, and we can test the project using both PHP and HTTP requests.
To start we will fork a plugin from GitHub and learn how to run it locally using the Playground CLI. After that, we will implement integration and end-to-end tests for our plugin using Playground.
Once we have all tests working we will add a GitHub action to run these tests on every commit in GitHub.

## Requirements:

- [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm#installing-and-updating)
- [git](https://git-scm.com/downloads)

## Development setup:

1. Clone the repository:

```bash
git clone https://github.com/bgrgicak/workshop-building-automated-tests-with-wordpress-playground
```

2. Setup the Node.js environment:

```bash
nvm install
nvm use
```

3. Install the dependencies:

```bash
npm install
```

4. Run the WordPress site

TODO: update to real command

```bash
bun ~/Projects/wordpress-playground/packages/playground/cli/src/cli.ts server --autoMount
```

5. Run the tests:

```bash
npm test
```

## What are we building?

### Integration tests

- Response message function (`wbatwp_hello_response_message`)
- Rest API endpoint
  - Check if endpoint exists
  - Check if endpoint returns expected message
  - Check if endpoint is available only to admins
  - Check if input is sanitized

### End-to-end tests

- Admin page
  - Check if page loads
  - Check if the form works
  - Check if the data persists after a page reload

### GitHub Actions

- Run tests on every commit
- Run tests on every pull request
