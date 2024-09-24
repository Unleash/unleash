1\. Install the SDK
```sh
cargo add unleash-client
```

2\. Initialize Unleash
```rust
let client = client::ClientBuilder::default()
    .interval(500)
    .into_client::<UserFeatures, reqwest::Client>(
        "<YOUR_API_URL>",
        "unleash-onboarding-rust",
        "unleash-onboarding-instance",
        "<YOUR_API_TOKEN>",
    )?;
client.register().await?;
```
