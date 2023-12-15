---
title: How to Implement Feature Flags in React
slug: /feature-flag-tutorials/react
---

React is a popular JavaScript library utilized by millions of developers across the world to build user interfaces for frontend, mobile, or server-side applications when paired with frameworks. Originally developed by Meta, React has a strong community and is best used for interactive, complex, SEO-friendly application development.

Leveraging feature flags allows you to toggle on and off new features you’re developing, whether you’re experimenting in your local environment, testing for QA purposes, or rolling out to users in production. With Unleash, you can use our tooling to implement feature flags into your application and release new features faster, strategically, and safely. But how can you do this in React?

In this tutorial, you will learn how to set up and use feature flags in a React application. Along the way, you will:

1. [Spin up a local instance of Unleash](#1-install-and-run-unleash-on-your-local-machine)
2. [Create a feature flag](#2-create-and-enable-a-feature-flag)
3. [Generate an API token](#3-generate-an-api-token)
4. [Clone a React app](#4-clone-an-open-source-react-app)
5. [Set up Unleash in your app](#5-set-up-unleash-in-your-app)
6. [Toggle the visibility of a feature component](#6-use-the-feature-flag-to-rollout-a-notifications-badge)
7. [Verify the toggle experience](#7-verify-the-toggle-experience)


## Considerations for using feature flags with React


We recommend that you reduce sensitive user data exposure by conducting feature flag evaluations in a self-hosted environment. Evaluating on the client side in a React application could potentially expose sensitive data such as API keys, flag configurations and flag data. A server-side evaluation of feature flag is recommended practice for privacy protection, as it will minimize sending data to the Feature Flag Control Service and reduce the attack surface of your application/services. A server-side evaluation improves the performance of your application, saves cost and improves the resilience of your application in the case of service outages.

We also recommend limiting the payloads of your feature flags when they are sent between your React application and your feature flagging service. Large payloads can increase network traffic and therefor negatively impact web performance. With smaller payloads, feature flag evluations will be faster, your apps will be more scalable, and tracing problems in your system will be much easier to monitor and debug.

Read more on best practices in our [11 Principles for Building and Scaling Feature Flag Systems](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices).


## Prerequisites


In this tutorial, you will need the following:

- A web browser like Chrome or Firefox
- Git
- Docker
- NPM, Node and Yarn to install and run a React app
- (Optional) A code editor like Visual Studio Code


![React Feature Flag Architecture Diagram](/img/react-tutorial-architecture-diagram.png)


### 1. Install and run Unleash on your local machine


In this section, you will install Unleash in order to run it, log in, and create a feature flag. You will use Git to clone the Unleash repository and Docker to build and run it.

Open a terminal window and run the following commands:

```
git clone git@github.com:Unleash/unleash.git
cd unleash
docker compose up -d
```

You will now have Unleash installed onto your machine and running in the background.
You can access this instance in your web browser at [http://localhost:4242](http://localhost:4242/)

Log in to the platform using these credentials:

```
Username: admin
Password: unleash4all
```

The unleash platform shows a list of feature flags that you’ve generated. Click on the ‘New Feature Toggle’ button to create a new feature flag.

![Create a new feature flag](/img/react-tutorial-create-new-flag.png)


### 2. Create and enable a feature flag


Next, you will create a feature flag on the platform and turn it on for your React app.

In the [Create Toggle view](http://localhost:4242/projects/default/create-toggle/), give your feature flag a unique name and click ‘Create toggle feature’.

For the purpose of this tutorial, you won’t need to change the default values in the rest of the feature flag form.

Your new feature flag is created and ready to be used. Enable the flag for your development environment, which makes it accessible to be used in the React app we will generate from your local environment.

![Create feature flag form](/img/react-tutorial-create-flag-form.png)


Your new feature flag is created and ready to be used. Enable the flag for your development environment, which makes it accessible to be used in the React app we will generate from your local environment.

![Enable flag for development environment](/img/react-tutorial-enable-dev-env.png)


### 3. Generate an API token


Next, you will generate an API token to authenticate calls made to Unleash servers to access and use the feature flag in your project. This API token will eventually be pulled into a configuration object within your React application to toggle features.

From your project view on the platform, click on [Project Settings](http://localhost:4242/projects/default/settings/environments) and then [API Access](http://localhost:4242/projects/default/settings/api-access).

Click on the ‘New API token’ button.

![Create new API token](/img/react-tutorial-create-api-token.png)

Name the API token and connect to the Client-side SDK. 

The token should have access to the “development” environment, as shown in the platform screenshot below.

![Create new projet API token](/img/react-tutorial-create-api-token-form.png)

The API token you have generated can be managed in the API Access view in your project settings. This token will come in handy in Step 5.


### 4. Clone an open source React app


In this section, you will clone an open source React application called [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app), which is meant to model what a more complex, real life use case would be for a fully-functioning app to experiment in.

This project leverages many libraries and frameworks to handle the user interface, functionality, database, authentication, and testing of a financial transaction app. These frameworks include Express, Material-UI, Cypress, TypeScript and more.

Go to your Terminal and clone the repository with this command:

```
git clone git@github.com:cypress-io/cypress-realworld-app.git
```

> :triangular_flag_on_post: **Note:** 
Since Yarn is required in order to run the app, make sure you have it installed globally. If you do not, run the command below.

```
npm install yarn@latest -g
```

In your app's directory, begin installing the dependencies and then run the app:

```
yarn
yarn dev
```

> **Note**: We recommend using the default ports that exist in the app's configurations, which are explained in the [README](https://github.com/cypress-io/cypress-realworld-app?tab=readme-ov-file#run-the-app) for it to point to. In order to ensure those function as expected, make sure no other apps are running on your machine that also port to `localhost:3000` and `localhost:3001`.

In your browser at `http://localhost:3000`, you will be directed to the sign-in page of the Cypress Real World App.
Utilize one of the pre-existing user accounts from the database to sign in.

```
Username: Allie2
Password: s3cret
```

For more detailed instructions on the setup process for this app, review the [README](https://github.com/cypress-io/cypress-realworld-app?tab=readme-ov-file#getting-started).


### 5. Set up Unleash in your app


It’s time to pull in your newly created feature flag in your app. Run the following command to install the Unleash React SDK in your repo:

```
yarn add @unleash/proxy-client-react unleash-proxy-client
```

Once Unleash has been installed, open up a code editor like VSCode to view your React repo.

In `src/index.tsx`, import the `<FlagProvider>`:

```js
import { FlagProvider } from "@unleash/proxy-client-react";
```

Paste in a configuration object:

```js
const config = {
 url: "http://localhost:4242/api/frontend", // Your local instance Unleash API URL
 clientKey: "<client_key>", // Your client-side API token
 refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
 appName: "cypress-realworld-app", // The name of your application. It's only used for identifying your application
};
```

In the `Router` section of this file, wrap the `FlagProvider` around the existing `<App />` component:

```js
<FlagProvider config={config}>
  <App />
</FlagProvider>
```

Next, replace the `<client_key>` string in the config object with the API token you generated. You can do this by copying the API token into your clipboard from the API Access view table and pasting it into the code. 

This configuration object is used to populate the `FlagProvider` component that comes from Unleash and wraps around the application, using the credentials to target the specific feature flag you created for the project.

You can find more documentation on Unleash API tokens and client keys [here](https://docs.getunleash.io/reference/api-tokens-and-client-keys#front-end-tokens).

Additionally, we have documentation on using the [Client-Side SDK with React](https://docs.getunleash.io/reference/sdks/react) for advanced use cases.


### 6. Use the feature flag to rollout a notifications badge

In a real world use case for your feature flag, you can gradually rollout new features to a percentage of users by configuring the flag's strategy.
In this case, we want to rollout a new notifications badge that will appear in the top navigation bar so users can see the latest updates from transactions between contacts.

In `src/components/NavBar.tsx`, import the `useFlag` feature:

```js
import { useFlag } from "@unleash/proxy-client-react";
```

Within the `NavBar` component in the file, define and reference the flag you created.

```js
const notificationBadgeEnabled = useFlag("newNotificationBadge");
```

This flag will be used to conditionally render the notification icon `Badge` that is pulled in from Material-UI. 
If the flag is enabled, the notification badge will display to users and will route them to the Notifications view.

Find the `Badge` component in the file and wrap it in a boolean operator:

```js
{notificationBadgeEnabled && (
  <Badge
    badgeContent={allNotifications ? allNotifications.length : undefined}
    data-test="nav-top-notifications-count"
    classes={{ badge: classes.customBadge }}
  >
    <NotificationsIcon />
  </Badge>
)}
```

> **Note:** Ensure you have the correct format in your file or the Prettier formatter will display an error. 


### 7. Verify the toggle experience


In your Unleash instance, you can toggle your feature flag on or off to verify that the different UI experiences load accordingly.

Disable the flag for the development environment, which results in a view of a navigation menu without the notification badge.

![Notification icon badge visible](/img/notification-icon-visible.png)

You've successfully implemented a feature flag using best practices to control the release of a notifications feature in a real world app!


### Conclusion

In this tutorial, you learned how to install Unleash onto your machine, create a new feature flag, install Unleash into a new React project, and toggle a feature flag to rollout a notifications feature.

