---
title: How to Implement Feature Flags in Astro using Unleash
---
:::note

This article is a contribution by **[Rishi Raj Jain](https://www.linkedin.com/in/rishi-raj-jain/)** as a part of the **[Community Content Program](https://github.com/unleash/community-content)**. You can also suggest a topic by [opening an issue](https://github.com/Unleash/community-content/issues), or [Write for Unleash](https://www.getunleash.io/blog/get-published-through-unleashs-community-content-program) as a part of the Community Content Program.

:::

Feature flags are a powerful technique that allows you to toggle features on and off dynamically without redeploying your code. This can help you to deliver faster and safer web applications, as you can test new user journeys in production, perform gradual rollouts, and revert changes as required, all without triggering a redeploy.

In this tutorial, you will learn how to use feature flags in a [Astro](https://astro.build) application that displays onboarding flow to users, using Unleash. We will use the `unleash-client` package, which provides easy integration of Unleash feature flags in an Astro application.

## What we’ll be using

- [Astro](https://astro.build) (UI and API Routes)
- [Unleash](https://getunleash.io) (Feature Flags)
- [Tailwind CSS](https://tailwindcss.com) (Styling)

## What you'll need

- [Docker](https://docker.com)
- [Node.js 18](https://nodejs.org) (make sure npm works correctly)

## Setting up the project

To set up, just clone the app repo and follow this tutorial to learn everything that's in it. To fork the project, run:

```bash
git clone https://github.com/rishi-raj-jain/onboarding-feature-flag-with-unleash-and-astro
cd onboarding-feature-flag-with-unleash-and-astro
npm install
```

## Scaffolding an Astro app

Creating an Astro app is as easy as a single command:

```bash
npm create astro@latest
```

## Setup Unleash

1. Run the following commands in the terminal to fetch the `docker-compose.yml` for creating an Unleash instance:

```bash
curl -O https://getunleash.io/docker-compose.yml
docker-compose up -d
```

This will start Unleash in the background. Once Unleash is running, you can access it at [http://localhost:4242](http://localhost:4242).

2. Now use the default credentials to log into the instance:

```bash
Username: admin
Password: unleash4all
```


## Create a New Feature

Create a new feature flag in your Unleash instance named `onboarding`.

![Create a new feature flag in Unleash](/img/create-new-flag-astro.png)


## Integrating Unleash in Astro

### Installation

To get started with Astro and Unleash, you need to install `unleash-client` package as a dependency.


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

### Initialize Unleash SDK

To make feature flags available to our Astro application, we will create a unleash helper file. This helper will initialize the Unleash SDK and provide access to feature flags throughout our application. We will do this by adding it to our `src/lib/unleash.ts` file.

```typescript
// File: src/lib/unleash.ts

import { startUnleash } from 'unleash-client'

const getUnleash = async () =>
  await startUnleash({
    appName: 'onboarding',
    url: import.meta.env.UNLEASH_API_URL,
    customHeaders: {
      Authorization: import.meta.env.UNLEASH_AUTHORIZATION_KEY,
    },
  })

export default getUnleash
```

### Use Unleash SDK to fetch the feature flag value


Next, we will redirect the user upon entering their sign up information, and then use the `isEnabled` method to determine whether onboard them or not.


```typescript
// File: src/pages/api/signup.ts

import getUnleash from '@/lib/unleash'

const unleash = await getUnleash()

export async function POST({ request }) {
  try {
    const formData = await request.formData()
    const userName = formData.get('name')
    const userPass = formData.get('password')

    // ...
    // Do user data lookup/signup to load/save user specifics
    // ...

    // Now if the user is not found, check per your feature flag
    // Whether you want to show the onboarding flow to user
    const shouldOnboard = unleash.isEnabled('onboarding')
    console.log(['User', userName, 'will', !shouldOnboard && 'not', 'be onboarded'].filter((i) => i).join(' '))
    if (shouldOnboard) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/onboarding',
        },
      })
    } else {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/dashboard',
        },
      })
    }
  } catch (e) {
    console.log(e.message || e.toString())
    return new Response('Internal Server Error', {
      status: 500,
    })
  }
}
```


Our feature flag can now be used to control whether or not a user be `onboarded`.

## Scenario 1. If we toggle on the gradual roll out

![Gradual Rollout](/img/gradual-rollout-astro.png)

### The onboarding flow is displayed

![Onboarding Successful](/img/onboarding-success-astro.png)

## Scenario 2. If we toggle off the gradual roll out

![Toggle Off](/img/gradual-rollout-astro-1.png)

## No onboarding flow is displayed

![Onboarding Failure](/img/onboarding-failure-astro.png)

## Using Unleash in Production

To setup Unleash for production, please follow the steps below:

1. Self-host Unleash, or run an instance on [Unleash Cloud](https://www.getunleash.io/pricing).

2. Get an [API key](/reference/api-tokens-and-client-keys) from the Unleash dashboard.

3. Store the API key in your Environment Variables of your hosting, which secures it and makes it accessible in your code.

## Conclusion

Feature flags are a powerful tool for managing features in web applications. This tutorial showed us how to use feature flags with Astro and Unleash. We have seen how to create and manage feature flags in the Unleash dashboard, and how to use them in our Astro code with the `unleash-client` package. We have also seen how to roll out onboarding flows with the use of feature flags incrementally, by toggling them on and off in the Unleash dashboard.
