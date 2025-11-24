---
title: How to Implement Feature Flags in Rust
description: "How to use Unleash feature flags with Rust."
slug: /guides/implement-feature-flags-in-rust
---

Hello! In this tutorial we’ll show you how to add feature flags to your Rust app, using [Unleash](https://www.getunleash.io/) and the official [Unleash Rust SDK](/reference/sdks/rust). With Unleash, an open-source feature management service, you can add feature flags to your applications and release new features faster.

We love Rust here at Unleash, our own [Unleash Edge](/reference/unleash-edge) is built with Rust and it's a core part of our product.

-   [Prerequisites](#prerequisites)
-   [1. Install a local feature flag provider](#1-install-a-local-feature-flag-provider)
-   [2. Convert an image to JPEG](#2-convert-an-image-to-jpeg)
-   [3. Add WebP support](#3-add-webp-support)
-   [4. Add Unleash to your Rust app](#4-add-unleash-to-your-rust-app)
-   [5. Verify the toggle experience](#5-verify-the-toggle-experience)
-   [Conclusion](#conclusion)

## Prerequisites

For this tutorial, you’ll need the following:

-   Rust
-   Git
-   Docker and Docker Compose

![architecture diagram for our implementation](/img/rust-guide-diagram.png)

The Unleash Server is a **Feature Flag Control Service**, which manages your feature flags and lets you retrieve flag data. Unleash has a UI for creating and managing projects and feature flags. There are also [API commands available](/get-started/api-overview) to perform the same actions straight from your CLI or app.

## 1. Install a local feature flag provider

In this section, we’ll install Unleash, run the instance locally, log in, and create a feature flag. If you prefer, you can use other tools instead of Unleash, but you’ll need to follow the instructions elsewhere. The basic steps will probably be the same.

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

Click the ‘New feature flag’ button to create a new feature flag.

![The "new feature flag" button is located on the project page](/img/ruby-guide-new-ff.png)

Call it `webp` and enable it in the `development` environment.

![A feature flag called `webp` is now visible.](/img/rust-guide-enable-ff.png)

Next, generate an API token to authenticate calls made to Unleash servers from your project.

:::info
Unleash requires SDKs to be set up with an API token. This is to ensure that only applications with the correct authentication can access your feature flags in Unleash. API tokens are created by users with API management access.
:::

From your project view on the platform, go to "Project Settings" and then "API Access". Or click "API Access" on the sidebar.

Select the ‘New API token’ button or copy an existing token.

![The API token button in API Access view](/img/tutorial-create-api-token.png)

Name the API token and select the “Backend SDK” token type. You can read more about [Unleash API tokens in our documentation](/reference/api-tokens-and-client-keys#backend-tokens).

![Selecting the API token type](/img/tutorial-api-token-type.png)

After that, the token should have access to the “development” environment, as shown in the platform screenshot below.

![Unleash's API token list](/img/tutorial-api-token-list.png)

The API token you generated can be managed in the API Access view in your project settings. It will come in handy later.

Everything’s now setup on the Unleash side. Let’s go to the code.

## 2. Convert an image to JPEG

Open a new tab in your terminal, and create a new Rust project (NOT in the unleash folder).

```sh
cargo new rust-ff-tutorial
```

This will create a new project with a `Cargo.toml` file and a `src` folder.

Add the following dependencies:

```sh
cargo add image webp
```

We use the `image` and `webp` crates to convert images to JPEG and WebP, respectively. The `unleash_api_client` crate is used to communicate with the Unleash server. The `tokio` crate will be used to make this connection asynchronous.

Final step before we start coding: Download this image or add an image of your own to your folder. Call it "/img/rust-guide-input.png." Make sure it's in the same folder as the rest of your cargo project.

!["The Great Wave off Kanagawa" by Hokusai. A woodblock print of a cresting wave.](/img/rust-guide-input.png)

Let's write some Rust code to convert the image to jpeg. We're relying on the `image` crate to read and convert the image file. We'll then use the feature flag that we just created to toggle the conversion to WebP rather than JPEG.

```rust
use image::ImageReader;
use std::{error::Error, fs};

fn main() -> Result<(), Box<dyn Error>> {
    println!("Hello, world!");

    process_image()?;

    Ok(())
}

fn process_image() -> Result<(), Box<dyn Error>> {
    let img = ImageReader::open("/img/rust-guide-input.png")?.decode()?;
    img.save_with_format("output.jpeg", image::ImageFormat::Jpeg)?;

    Ok(())
}

```

Run the code

```sh
cargo run
```

You should see another image named `output.jpeg` in your folder. Make sure that the image is the same and that the compression worked correctly.

## 3. Add WebP support

Now let's add support for WebP. We'll use a crate named `webp` for this, which gives us a straightforward `Encoder::from_image(&img)` method.

```rust
use image::ImageReader;
use std::{error::Error, fs};
use webp::Encoder;

fn main() -> Result<(), Box<dyn Error>> {
    println!("Hello, world!");

    let is_webp = true;
    process_image(is_webp)?;

    Ok(())
}

fn process_image(is_webp: bool) -> Result<(), Box<dyn Error>> {
    let img = ImageReader::open("/img/rust-guide-input.png")?.decode()?;

    if is_webp {
        let webp_data = Encoder::from_image(&img)?.encode(0.75);
        fs::write("output.webp", webp_data.to_vec())?;
    } else {
        img.save_with_format("output.jpeg", image::ImageFormat::Jpeg)?;
    }

    Ok(())
}

```

Run the code again:

```sh
cargo run
```

You should see another image named `output.webp` in your folder, alongside the `.jpeg` image. Make sure that all images are the same before continuing.

![Project directory containing the newly created `output.webp`](/img/rust-guide-webp-image-in-folder.png)

## 4. Add Unleash to your Rust app

Now, let’s connect our project to Unleash so that you can toggle that feature flag at runtime. If you wanted to, you could also do a gradual rollout, run A/B tests, etc.

You’ll need 3 things:

-   The Unleash SDK installed.
-   The URL of your Unleash instance’s API. It’s `http://localhost:4242/api/` for your local version. You’ll want to replace it with your remote instance.
-   The API token we created on our Unleash instance, feel free to create another one if you can’t find it.

Let's first install all the SDK and all its dependencies.

```sh
cargo add enum-map@2.0.3
cargo add reqwest --features json
cargo add serde --features derive
cargo add tokio --features full
cargo add unleash-api-client --features reqwest
```

There are a few dependencies, and here's why: We need an HTTP client to make the request, and `serde` to deserialize the Unleash response. Our SDK constantly polls Unleash to retrieve your feature flags, caches them and does the evaluation on the fly.

We want to let you choose the nature of that concurrency, so we're compatible with `async-std`, `tokio` and standard threads. We're picking `tokio` here.

```rust
use enum_map::Enum;
use image::ImageReader;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs;
use std::time::Duration;
use tokio::time::sleep;
use unleash_api_client::client::ClientBuilder;
use unleash_api_client::Client;
use webp::Encoder;

#[derive(Debug, Deserialize, Serialize, Enum, Clone)]
enum Flags {
    webp,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    let client:Client<Flags, reqwest::Client> = ClientBuilder::default().into_client(
        "http://localhost:4242/api",
        "unleash-rust-client-example",
        "unleash-rust-client-example",
        Some("default:development.unleash-insecure-api-token".to_string()),
    )?;
    client.register().await?;

    let (_, _) = tokio::join!(client.poll_for_updates(), async {
        // Ensure we have features for this demo.
        sleep(Duration::from_millis(500)).await;

        let is_webp = client.is_enabled(Flags::webp, None, false);
        process_image(is_webp)?;

        // allow tokio::join to finish
        client.stop_poll().await;
        Ok::<(), Box<dyn Error + Send + Sync>>(())
    });

    Ok(())
}

fn process_image(is_webp: bool) -> Result<(), Box<dyn Error + Send + Sync>> {
    let img = ImageReader::open("/img/rust-guide-input.png")?.decode()?;

    if is_webp {
        let webp_data = Encoder::from_image(&img)?.encode(0.75);
        fs::write("output.webp", webp_data.to_vec())?;
    } else {
        img.save_with_format("output.jpeg", image::ImageFormat::Jpeg)?;
    }

    Ok(())
}
```

## 5. Verify the toggle experience

Now that we’ve connected our project to Unleash and grabbed our feature flag, we can verify that if you disable that flag in your development environment, you should only see the WebP conversion.

:::info
Your feature flag configuration will only update as often as your SDK polls Unleash. The default polling interval for the Rust SDK is 15 seconds, but you can set whatever interval works best for your use case.
:::

## Conclusion

All done! Now you know how to add feature flags with Unleash in Rust. You’ve learned how to:

-   Convert images to JPEG and WebP using Rust
-   Install Unleash and create/enable a feature flag
-   Initialise the Unleash client and provide it with an async runtime
-   Grab the value of a feature flag with the Rust SDK

Thank you!
