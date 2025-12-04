---
title: How to Implement Feature Flags in Next.js using Unleash
slug: /guides/implement-feature-flags-in-nextjs
---

:::note

This article is a contribution by **[Kafilat Adeleke](https://www.linkedin.com/in/kafilat-adeleke-650332222/)** as a part of the **[Community Content Program](https://github.com/unleash/community-content)**. You can also suggest a topic by [opening an issue](https://github.com/Unleash/community-content/issues), or [Write for Unleash](https://www.getunleash.io/blog/get-published-through-unleashs-community-content-program) as a part of the Community Content Program.

:::

Imagine turning on and off features in your web application without redeploying your code. Sounds too good to be true? It's possible with feature flags and Next.js, a powerful framework for building fast and scalable web applications using React.

Feature flags are a powerful technique that allows you to toggle features on and off dynamically without redeploying your code. This can help you to deliver faster and safer web applications, as you can test new features in production, perform gradual rollouts, and revert changes quickly if something goes wrong.

Next.js provides features such as:

-   Server-side rendering
-   Static site generation
-   Code splitting
-   Dynamic routing
-   TypeScript support
-   CSS modules support
-   And many more

With Next.js, you can create hybrid applications that can use both static and dynamic pages. Static pages are pre-rendered at build time and served from a CDN, which makes them fast and secure. Dynamic pages are rendered on-demand by a Node.js server, which allows you to use data from any source and handle user interactions. You can also use incremental static regeneration to update static pages without rebuilding your entire application.

However, one of the challenges of using Next.js is that it requires you to rebuild your application every time you want to change something in your code. This can be time-consuming and risky, especially if you want to test new features in production or perform gradual rollouts. Therefore, you need a way to toggle features on and off dynamically without redeploying your code. This is where feature flags come in.

Unleash is an open-source, easy-to-use feature management platform that supports Next.js and other frameworks. With Unleash, you can create and manage feature flags from a user-friendly dashboard and use them in your code with a simple API. Unleash also provides advanced features such as segmentation, strategies, and integrations.

In this tutorial, you will learn how to use feature flags in a Next.js application that displays random activities to users using Unleash. We will use the `@unleash/nextjs` package, which provides easy integration of Unleash feature flags in a Next.js application.
Note: If you only need a very simple setup for feature flags in your Next.js application, like toggling a feature on and off for all users, use the [Vercel Edge Config](https://vercel.com/docs/storage/edge-config/get-started). You can avoid making requests to the Unleash API from your application and instead use the edge config to inject the feature flag values into your pages.
![Next.js Feature Flag Architecture Diagram](/img/nextjs-feature-flag-architecture-diagram-blog.png)

## Setup Unleash

Before you proceed, ensure you have an Unleash instance running. Run the following commands in the terminal:

```
wget getunleash.io/docker-compose.yml
docker-compose up -d
```

This will start Unleash in the background. Once Unleash is running, you can access it at http://localhost:4242.

```
Username: admin
Password: unleash4all
```

## Create a New Feature

Create a new feature flag in your Unleash instance named "activity".

![Create a new feature flag in Unleash](/img/create-new-flag-nextjs.png)

## Integrating Unleash in Nextjs

To get started with Next.js and Unleash, you need to create a Next.js project and add the `@unleash/nextjs` package as a dependency.

You can run the following commands in your terminal to do this:

```
npx create-next-app activity-app
cd activity-app
npm install @unleash/nextjs
```

To make feature flags available to our Next.js application, we will wrap it with the FlagProvider component from the @unleash/nextjs package. This component will initialize the Unleash SDK and provide access to feature flags throughout our application. We will do this by adding it to our `pages/_app.tsx` file.

```tsx
import type { AppProps } from "next/app";
import { FlagProvider } from "@unleash/nextjs/client";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <FlagProvider>
            <Component {...pageProps} />
        </FlagProvider>
    );
}
```

Next, we will use the Bored API to retrieve a random activity and then use the `useFlag` feature to determine whether the activity is displayed or not.

```tsx
import { useEffect, useState } from "react";
import { useFlag } from "@unleash/nextjs/client";

const Activity = () => {
    const [activityData, setActivityData] = useState({});

    const showActivity = useFlag("activity");

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await fetch(
                    "https://www.boredapi.com/api/activity/"
                );
                const data = await response.json();
                setActivityData(data);
            } catch (error) {
                console.error("Error fetching activity:", error);
            }
        };

        if (showActivity) {
            fetchActivity();
        }
    }, [showActivity]);

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-lg">
                <h1 className="text-3xl font-bold mb-4">
                    Here is an activity for you!
                </h1>
                {showActivity ? (
                    <>
                        <p className="mb-2">
                            Activity: {activityData.activity}
                        </p>
                        <p className="mb-2">
                            Participants: {activityData.participants}
                        </p>
                        <p>Price: ${activityData.price}</p>
                    </>
                ) : (
                    <p>Activity not available</p>
                )}
            </div>
        </div>
    );
};

export default Activity;
```

Our feature flag can now be used to control whether or not activity is displayed. If we switch on the gradual roll out:

![Gradual Rollout](/img/gradual-rollout-nextjs.png)

The activity is displayed:

![Activity Successful](/img/activity-success-nextjs.png)

If we turn it off:

![Turn flag Off](/img/gradual-rollout-nextjs-1.png)

No activity is displayed:

![Activity Successful](/img/activity-success-nextjs-1.png)

To configure access to Unleash beyond localhost development, follow these steps:

-   Self-host Unleash or run an instance on [Unleash Cloud](https://www.getunleash.io/pricing).

-   Get an API key from the Unleash dashboard.

-   Store the API key in your Vercel Project Environment Variable, which secures it and makes it accessible in your code.

## Conclusion

Feature flags are a powerful tool for managing features in web applications. This tutorial showed us how to use feature flags with Next.js and Unleash. We have seen how to create and manage feature flags in the Unleash dashboard, and how to use them in our Next.js code with the @unleash/nextjs library. We have also seen how to test our feature flags by toggling them on and off in the Unleash dashboard.

Unleash is a powerful and easy-to-use feature management platform that can help you deliver faster and safer web applications with Next.js and other frameworks. If you are not already using feature flags in your Next.js applications, I encourage you to try Unleash and see how it can improve your development workflow.
