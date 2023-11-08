---
title: How to Implement Feature Flags in Node.js using Unleash
---
:::note

This article is a contribution by **[Rishi Raj Jain](https://www.linkedin.com/in/rishi-raj-jain/)** as a part of the **[Community Content Program](https://github.com/unleash/community-content)**. You can also suggest a topic by [opening an issue](https://github.com/Unleash/community-content/issues), or [Write for Unleash](https://www.getunleash.io/blog/get-published-through-unleashs-community-content-program) as a part of the Community Content Program.

:::

Feature flags are a powerful technique that allows you to toggle features on and off dynamically without redeploying your code. This can help you to deliver faster and safer web applications, as you can test new user journeys in production, perform gradual rollouts, and revert changes as required, all without triggering a redeploy.

In this tutorial, you will learn how to use feature flags in a [Node.js](https://nodejs.org) application that displays onboarding flow to users, using Unleash. We will use the `unleash-client` package, which provides easy integration of Unleash feature flags in a Node.js application.

## What we’ll be using

- [Node.js](https://nodejs.org) (UI and API Routes)
- [Unleash](https://getunleash.io) (Feature Flags)

## What you'll need

- [Docker](https://docker.com)
- [Node.js 18](https://nodejs.org) (make sure npm works correctly)

## Setting up the project

To set up, just clone the app repo and follow this tutorial to learn everything that's in it. To fork the project, run:

```bash
git clone https://github.com/rishi-raj-jain/user-access-feature-flag-with-unleash-and-node
cd user-access-feature-flag-with-unleash-and-node
npm install
```

## Scaffolding a Node.js app

Creating an Node.js app is as easy as a single command:

```bash
mkdir feature-flag-with-unleash-and-node
cd feature-flag-with-unleash-and-node
npm init -y
```

## Setup Unleash

1. Run the following commands in the terminal to fetch the `docker-compose.yml` for creating an Unleash instance:

```bash
wget getunleash.io/docker-compose.yml
docker-compose up -d
```

This will start Unleash in the background. Once Unleash is running, you can access it at [http://localhost:4242](http://localhost:4242).

2. Now use the default credentials to log into the instance:

```bash
Username: admin
Password: unleash4all
```

## Create a New Feature Flag

Create a new feature flag in your Unleash instance named `configuration`:

![Create a new feature flag in Unleash](/img/nodejs_feature_flag_setup.png)

In the feature flag's dashboard, click on `Add strategy`:

![View Feature Flag Dashboard](/img/nodejs_feature_flag_dashboard.png)

Click on `Add Constraint` on the sidebar that opens up, and set the `Context Field` to `userId`. This will allow us to put conditional constraints on the `userId` value. In this example, we're aiming to allow all the users with the email that have `@unleash.com` in them, so we'll set the `Operator` to `STR_CONTAINS` and set value in the input field as `@unleash.com`. Finally, click `Save` to associate this constraint with the `configuration` feature flag.

![Setup Feature Flag Constraint](/img/nodejs_feature_flag_userId.png)

## Integrating Unleash in Node.js app

### Installation

To get started with Node.js and Unleash, you need to install `unleash-client` package as a dependency.

You can run the following commands in your terminal to do this:

```bash
npm install unleash-client
```

### Set up Environment Variables

By default, the following values are setup in your local Unleash instance

```bash
# .env

UNLEASH_API_URL="http://localhost:4242/api"
UNLEASH_AUTHORIZATION_KEY="default:development.unleash-insecure-api-token"
```

### Create a simple HTTP server with Node.js

```javascript
// File: index.js

require('dotenv').config()

// Specify the port and host to listen on
const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

const http = require('http')

const server = http.createServer(async (req, res) => {
    // Use req.url to conditionally send responses
    // based on the url
})

// Start the server and listen on the specified host and port
server.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`)
})
```

### Initialize Unleash SDK as soon as possible

To make feature flags available to our Node.js application, we will create a `setupUnleash` helper function. This helper will initialize the Unleash SDK and provide access to feature flags throughout our application. Also, to make sure that we re-use once initialized unleash instance, we declare a global variable `unleash` which makes sure that once unleash SDK is initialized, is available globally.

```javascript
// File: index.js

// ..
// Utilities Imports
// ..

const { startUnleash } = require('unleash-client')

let unleash

async function setupUnleash(callback) {
  try {
    unleash = await startUnleash({
    appName: 'user-access-levels',
    url: process.env.UNLEASH_API_URL,
    customHeaders: {
      Authorization: process.env.UNLEASH_AUTHORIZATION_KEY,
    },
  })
    console.log('Initialize Unleash SDK succesfully.')
  } catch (e) {
    console.log('Could not initialize Unleash SDK.')
    console.log('The following error occured:')
    console.log(e.message || e.toString())
  } finally {
    callback()
  }
}

const server = http.createServer(async (req, res) => {
    // Use req.url to conditionally send responses
    // based on the url
})

// Perform asynchronous setup of Unleash SDK
setupUnleash(() => {
  // Start the server and listen on the specified host and port
  server.listen(port, host, async () => {
    console.log(`Listening on http://${host}:${port}`)
  })
})
```

### Use Unleash SDK to fetch the feature flag value

Next, we will redirect the user upon entering their sign up information, and then use the `isEnabled` method to determine whether onboard them or not.

```javascript
// File: index.js

// ..
// Utilities Imports
// ..

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  if (req.url.includes('/dashboard/new')) {
    
    // ...
    // Get form data
    // This is just an example, but you might want to persist user data
    // through cookies on the server and not rely on the request body
    // to send it to the server for security reasons
    // ...
    
    // Access the parsed form fields using the 'fields' object from formidable
    const userId = fields.email[0]
    
    // Check if the particular userId should 
    // be allowed to view the new dashboard
    const showNewDashboard = unleash.isEnabled('configuration', { userId })
    
    // If yes, send response with the dashboard layout
    if (showNewDashboard) return serve(assets['/newDashboard'], res)
    
    // Else, show the user new denied page
    return serve(assets['/deniedDashboard'], res)
  }

  // By default, serve the homepage
  // Read the page from the pages/index.html file
  return serve(assets['/'], res)
})
```

Our feature flag can now be used to control whether or not a user be shown the new dashboard upon logging in.

## Rollout feature flag effect in production

By default, you'll observe that `Gradual Rollout` value is set to 50%. In this example, we set the value to 100%, implying that all users that have `@unleash.com` in their email, will be taken to the new dashboard. Here's how you do it:

![Toggle On Feature Flag](/img/nodejs_feature_flag_toggle_on.png)

Alright! With that done, let's test out the onboarding flow. Here's how our homepage looks like:

![Onboarding Home](/img/nodejs_feature_flag_home.png)

Now, let's proceed with `rishi@random.com` as the email of the user. You'd see that it takes you to the page, denying access to the new dashboard.

![Onboarding Failure](/img/nodejs_feature_flag_denied_dashboard.png)

Now, let's proceed with `rishi@unleash.com` as the email of the user. You'd see that it takes you to the new dashboard! Great.

![Onboarding Successful](/img/nodejs_feature_flag_new_dashboard.png)

## Revert: How to disable feature flag effect in production

Say you want to not have the feature flag to be in effect anymore. To do that, just set the `Gradual Rollout` to 0% which'll lead in `isEnabled('configuration', { userId })` call to return `false` everytime. Here's how you can do it:

![Toggle Off Feature Flag](/img/nodejs_feature_flag_toggle_off.png)

## Using Unleash in Production

To setup Unleash for production, please follow the steps below:

1. Self-host Unleash, or run an instance on [Unleash Cloud](https://www.getunleash.io/pricing).

2. Get an [API key](/reference/api-tokens-and-client-keys) from the Unleash dashboard.

3. Store the API key in your Environment Variables of your hosting, which secures it and makes it accessible in your code.

## Conclusion

Feature flags are a powerful tool for managing features in web applications. This tutorial showed us how to use feature flags with Node.js and Unleash. We have seen how to create and manage feature flags in the Unleash dashboard, and how to use them in our Node.js code with the `unleash-client` package. We have also seen how to roll out onboarding flows with the use of feature flags incrementally, by toggling them on and off in the Unleash dashboard.
