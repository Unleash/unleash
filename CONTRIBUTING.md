# Contributing to Unleash

## Getting started

Before you begin:

- Have you read the [code of conduct](CODE_OF_CONDUCT.md)?
- Check out the [existing issues](https://github.com/unleash/Unleash/issues)
- Browse the [developer-guide](./website/docs/contributing/developer-guide.md) for tips on environment setup, running the tests, and running Unleash from source.

### Don't see your issue? Open one

If you spot something new, [open an issue](https://github.com/unleash/Unleash/issues/new). We'll use the issue to have a conversation about the problem you want to fix. If we need more information in order to look into issue we'll respond on the issue and also and mark the issue as `more-information-needed`. Please note that we have an active bot monitoring our open issues that will close issues marked as `more-information-needed` if we haven't received a response within 14 days. If this happens, please don't hesitate to reopen the issue with more information.

### Ready to make a change? Fork the repo

Fork using GitHub Desktop:

- [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
- Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

Fork using the command line:

- [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

Fork with [GitHub Codespaces](https://github.com/features/codespaces):

- [Fork, edit, and preview](https://docs.github.com/en/free-pro-team@latest/github/developing-online-with-codespaces/creating-a-codespace) using [GitHub Codespaces](https://github.com/features/codespaces) without having to install and run the project locally.

### Make your update:

Make your changes to the file(s) you'd like to update. You'll need **Node.js v14** and PostgreSQL 10 to run Unleash locally. [See more details](https://github.com/Unleash/unleash/tree/master/website/docs/contributing/developer-guide.md)

### Open a pull request

When you're done making changes and you'd like to propose them for review by opening a pull request.

### Submit your PR & get it reviewed

- Once you submit your PR, others from the Unleash community will review it with you. The first thing you're going to want to do is a self review.
- After that, we may have questions, check back on your PR to keep up with the conversation.
- Did you have an issue, like a merge conflict? Check out GitHub's [git tutorial](https://lab.github.com/githubtraining/managing-merge-conflicts) on how to resolve merge conflicts and other issues.
- We do have bots monitoring our open PRs, which will mark PRs as stale if they haven't had any activity within 30 days and close stale issues without activity after another 7 days. If you feel this was in error, please reach out to us or reopen the issue with more information.

### Your PR is merged!

Congratulations! The whole Unleash community thanks you. :sparkles:

Once your PR is merged, you will be proudly listed as a contributor in the [contributor chart](https://github.com/unleash/Unleash/graphs/contributors).

## Nice to know

### Controllers

In order to handle HTTP requests we have an abstraction called [Controller](https://github.com/Unleash/unleash/blob/master/src/lib/routes/controller.ts). If you want to introduce a new route handler for a specific path (and sub pats) you should implement a controller class which extends the base Controller. An example to follow is the [routes/admin-api/feature.ts](https://github.com/Unleash/unleash/blob/master/src/lib/routes/admin-api/feature.ts) implementation.

The controller takes care of the following:
- try/catch RequestHandler method
- error handling with proper response code if they fail
- `await` the RequestHandler method if it returns a promise (so you don't have to)
- access control so that you can just list the required permission for a RequestHandler and the base Controller will make sure the user have these permissions.

## Creating a release
In order to produce a release you will need to be a Unleash core team member and have the Unleash admin role assigned on the Unleash organization on GitHub.

### Step 1: create a new version tag

Use npm to set the version in package.json and specify a version tag.

```sh
npm version 3.10.0
```

This command will trigger an internal verification step where we will perform the following steps:

- *STEP 1. Check unleash-frontend version* - Validate that a latest release of unleash-server does not depend on a pre-release of unleash-frontend (beta, alpha, etc)
- *STEP 2. Lint* - Run lint checks on the code.
- *STEP 3. Build* - Validate that we are able to build the project
- *STEP 4. Test* - Validate that all test runs green.

If all steps completes a single commit is produced on the main branch where the `version` property in package.json is updated, and a git tag is created to point to that tag specifically.

### Step 2: push tag

```sh
git push origin main --follow-tags
```

This will push the new tag and a GitHub action will trigger on the new version tag, build the release and publish it to npm.
