---
title: How to Implement Feature Flags in JavaScript
description: "How to use Unleash feature flags with plain JavaScript."
slug: /feature-flag-tutorials/javascript
---

import VideoContent from '@site/src/components/VideoContent.jsx';

Hello! In this tutorial we'll show you how to add feature flags to a plain JavaScript app, using [Unleash](https://www.getunleash.io/) and the official [Unleash Browser SDK](/reference/sdks/javascript-browser). With Unleash, an open-source feature flag service, you can add feature flags to your application and release new features faster.

In this tutorial, we'll make a basic website all about... Corgis! We'll use the [dog.ceo API 🐶](https://dog.ceo/) with HTML, CSS, JS to retrive some images of Queen Elisabeth's favourite dogs. We'll use feature flags to decide whether to show some corgi fun facts alongside the images.

## Prerequisites

For this tutorial, you'll need the following:

-   Git
-   Docker and Docker Compose
-   A modern browser

![architecture diagram for our implementation](./diagram.png)

The Unleash Server is a **Feature Flag Control Service**, which manages your feature flags and lets you retrieve flag data. Unleash has a UI for creating and managing projects and feature flags. You can perform the same actions straight from your CLI or server-side app using the [Unleash API](/reference/api/unleash).

## Install a local feature flag provider

In this section, we'll install Unleash, run the instance locally, log in, and create a feature flag. If you prefer, you can use other tools instead of Unleash, but you'll need to update the code accordingly.

Use Git to clone the Unleash repository and Docker to build and run it. Open a terminal window and run the following commands:

```
git clone https://github.com/unleash/unleash.git
cd unleash
docker compose up -d
```

You will now have Unleash installed onto your machine and running in the background. You can access this instance in your web browser at [http://localhost:4242](http://localhost:4242).

Log in to the platform using these credentials:

```
Username: admin
Password: unleash4all
```

Click **New feature flag** to create a new feature flag.

![Create a new feature flag](/img/go-new-feature-flag.png)

Call it `show-info` and enable it in the `development` environment.

Everything's now set up on the Unleash side. Let's go to the code now.

## Make a basic HTML website

Open a new tab in your terminal, and create a new folder (outside of the unleash folder).

```sh
mkdir unleash-js
cd unleash-js
touch index.html
```

Add our HTML:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Corgi Cuteness</title>
        <link
            rel="stylesheet"
            href="https://cdn.simplecss.org/simple.min.css"
        />
        <style>
            :root {
                --accent: #f4a261;
                --border: #d9c3b8;
            }

            h1 {
                color: var(--accent);
            }

            main {
                padding: 1rem;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <main>
            <h1>🐾 Corgi Cuteness 🐾</h1>
            <img id="corgi-img" src="" alt="Adorable Corgi" />
            <p id="fun-fact" class="notice"></p>
            <button id="new-corgi-btn">Show Me Another Corgi!</button>
        </main>

        <script src="./index.js"></script>
    </body>
</html>
```

Open the file in your browser, you'll see something like this:

![A non-fonctional website with only a button and a notice box](./template.png)

## Fetch from the API

Our website is looking a little empty and useless. Let's add a bit of JavaScript to fetch a photo of a corgi from the [dog.ceo API 🐶](https://dog.ceo/) and insert a random piece of information (or, fun fact) in the notice box. We'll add an event listener to the button so we can do the same when we click it.

```js
import { UnleashClient } from "https://esm.sh/unleash-proxy-client";

const corgiImg = document.getElementById("corgi-img");
const funFact = document.getElementById("fun-fact");
const newCorgiBtn = document.getElementById("new-corgi-btn");
const unleash = null;

const funFacts = [
    "Corgis were originally bred for herding cattle and sheep.",
    "The name 'Corgi' means 'Dwarf Dog' in Welsh.",
    "Corgis are the favorite dog breed of Queen Elizabeth II.",
    "Corgis have a 'fairy saddle' marking on their back.",
    "There are two types of Corgis: Pembroke and Cardigan.",
    "Corgis are excellent swimmers despite their short legs.",
    "A group of Corgis is called a 'corggle'.",
];

async function start() {
    await fetchCorgi();
}

async function fetchCorgi() {
    corgiImg.alt = "Loading...";
    funFact.textContent = "Fetching a cute Corgi...";

    const response = await fetch(
        "https://dog.ceo/api/breed/corgi/images/random"
    );
    const data = await response.json();
    corgiImg.src = data.message;

    funFact.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];
}

newCorgiBtn.addEventListener("click", fetchCorgi);

start();
```

Refresh your browser again. Our mini website is now functional.

![Our mini corgi website](./corgi-site.png)

## 5. Add Unleash to your website

Now, let's connect our project to Unleash so that you can toggle a feature flag at runtime. If you wanted to, you could also do a [gradual rollout](/feature-flag-tutorials/use-cases/gradual-rollout) or use the flag for [A/B testing](/feature-flag-tutorials/use-cases/a-b-testing).

You'll need 2 things:

-   The URL of your Unleash instance's API. It's `http://localhost:4242/api/` for your local version.
-   The API token we created on our Unleash instance, feel free to create another one if you can't find it.

With these 2, you can initialize your Unleash client as follows:

```js
const unleash = new UnleashClient({
    url: "http://localhost:4242/api/",
    clientKey: "YOUR_API_KEY",
    appName: "corgi-site",
});
```

Now, let's add our client to the project, after the selectors. Don't forget to also update the config with your API key:

```js
const corgiImg = document.getElementById("corgi-img");
const funFact = document.getElementById("fun-fact");
const newCorgiBtn = document.getElementById("new-corgi-btn");
const unleash = new UnleashClient({
    url: "http://localhost:4242/api/",
    clientKey: "YOUR_API_KEY",
    appName: "corgi-site",
});
```

Then, we can decide to show the info box only if the `show-info` flag is enabled. Let's update our `fetchCorgi` function so it looks like the following:

```diff
async function fetchCorgi() {
  corgiImg.alt = "Loading...";
  funFact.textContent = "Fetching a cute Corgi...";

+ const showInfo = unleash.isEnabled("show-info");
+ funFact.style.display = showInfo ? "block" : "none";

  const response = await fetch("https://dog.ceo/api/breed/corgi/images/random");
  const data = await response.json();
  corgiImg.src = data.message;

  funFact.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];
}
```

## 6. Verify the toggle experience

Now that we've connected our project to Unleash and grabbed our feature flag, we can verify that if you disable that flag in your development environment, you stop seeing the fun facts.

> **Note:** An update to a feature flag may take 30 seconds to propagate.

## Conclusion

All done! Now you know how to add feature flags with Unleash in plain JavaScript, without any frameworks or libraries. You've learned how to:

-   Toggle between a DOM element based on a feature flag
-   Install Unleash and create/enable a feature flag
-   Grab the value of a feature flag with just JavaScript.

Thank you
