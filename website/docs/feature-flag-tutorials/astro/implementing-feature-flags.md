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
- [React](https://react.dev) (UI Framework)
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
# Create an Astro app
npm create astro@latest

# Render React with Astro
npx astro add react
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

Create a new feature flag in your Unleash instance named `onboarding`:

![Create a new feature flag in Unleash](/img/astro_feature_flag_setup.png)

In the feature flag's dashboard, click on `Add strategy`:

![View Feature Flag Dashboard](/img/astro_feature_flag_dashboard.png)

Click `Save` to associate the pre-configured setup with the `onboarding` feature flag.

## Integrating Unleash in Astro

### Installation

To get started with Astro, React and Unleash, you need to install `@unleash/proxy-client-react` and `unleash-proxy-client` packages as dependencies.

You can run the following commands in your terminal to do this:

```bash
npm install @unleash/proxy-client-react unleash-proxy-client
```

### Initialize Unleash SDK

To make feature flags available to our Astro application, we will create an Unleash Context component. This helper will initialize the Unleash React SDK and provide access to feature flags throughout our application. We will do this by adding it to our `src/components/App.tsx` file.

```typescript
// File: src/components/App.tsx

import Dashboard from './Dashboard'
import { FlagProvider } from '@unleash/proxy-client-react'

const unleashConfig = {
  // How often (in seconds) the client should poll the proxy for updates
  refreshInterval: 1,
  // The name of your application. It's only used for identifying your application
  appName: 'onboarding',
  // Your front-end API URL or the Unleash proxy's URL (https://<proxy-url>/proxy)
  url: 'http://localhost:4242/api/frontend',
  // A client-side API token OR one of your proxy's designated client keys (previously known as proxy secrets)
  clientKey: 'default:development.unleash-insecure-frontend-api-token',
}

export default function () {
  return (
    <FlagProvider config={unleashConfig}>
      <Dashboard />
    </FlagProvider>
  )
}
```

### Use Unleash React SDK to fetch the feature flag value

Next, we will redirect the user upon entering their sign up information, and then use the `useFlag` hook to determine whether to onboard them or not.


```typescript
// File: src/components/Dashboard.tsx

import { useFlag } from '@unleash/proxy-client-react'

export default function () {
  const enabled = useFlag('onboarding')
  return (
    <>
      {enabled ? "Other" : "Another"}
    </>
  )
}
```

Our feature flag can now be used to control whether or not a user be `onboarded`.

## Rollout feature flag effect in production

By default, you'll observe that `Gradual Rollout` value is set to 50%. In this example, we set the value to 100%, implying that all users, will be taken through the onboarding flow. Here's how you do it:

![Toggle On Feature Flag](/img/astro_feature_flag_toggle_on.png)

Alright! With that done, let's test out the onboarding flow. Here's how our homepage looks like:

![Home](/img/astro_feature_flag_home.png)

Now, let's proceed with entering `iam@random.com` as the email, and `random.iam` as the password. You'd see that it takes you to the onboarding flow as you click on `Sign Up`.

![Onboarding Page](/img/astro_feature_flag_onboarding.png)

## Revert: How to disable feature flag effect in production

Say you want to not have the feature flag to be in effect anymore. To do that, just set the `Gradual Rollout` to 0% which'll lead in `useFlag('onboarding')` call to return `false` everytime. Here's how you can do it:

![Toggle Off Feature Flag](/img/astro_feature_flag_toggle_off.png)

Again, let's proceed with entering `iam@random.com` as the email, and `random.iam` as the password on the homepage. You'd see that it takes you to `dashboard` page (instead of the `onboarding` page). Great.

![Onboarding Failure](/img/astro_feature_flag_failure.png)

## Using Unleash in Production

To setup Unleash for production, please follow the steps below:

1. Self-host Unleash, or run an instance on [Unleash Cloud](https://www.getunleash.io/pricing).

2. Get an [API key](/reference/api-tokens-and-client-keys) from the Unleash dashboard.

3. Store the API key in your Environment Variables of your hosting, which secures it and makes it accessible in your code.

## Conclusion

Feature flags are a powerful tool for managing features in web applications. This tutorial showed us how to use feature flags with Astro and Unleash. We have seen how to create and manage feature flags in the Unleash dashboard, and how to use them in our Astro code with the `unleash-client` package. We have also seen how to roll out onboarding flows with the use of feature flags incrementally, by toggling them on and off in the Unleash dashboard.
