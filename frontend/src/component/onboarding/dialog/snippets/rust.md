1\. Install the SDK
```sh
cargo add unleash-api-client --features async-std,reqwest,surf
cargo add serde --features derive
cargo add serde reqwest --features json
cargo add serde tokio --features full
cargo add serde anyhow cfg cfg-if enum-map@~2.0.0 surf
```

2\. Run Unleash
```rust
use enum_map::Enum;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::time::Duration;
use tokio::time::sleep;
use unleash_api_client::client::ClientBuilder;
use unleash_api_client::Client;

#[derive(Debug, Deserialize, Serialize, Enum, Clone)]
enum Flags {
    #[serde(rename = "<YOUR_FLAG>")]
    TestFlag,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    let client: Client<Flags, reqwest::Client> = ClientBuilder::default()
        .into_client(
            "<YOUR_API_URL>",
            "unleash-onboarding-rust",
            "unleash-onboarding-instance",
            Some("<YOUR_API_TOKEN>".to_owned()), // in production use environment variable
        )?;
    client.register().await?;

    let (_, _) = tokio::join!(client.poll_for_updates(), async {
        sleep(Duration::from_millis(1000)).await;

        let is_enabled = client.is_enabled(Flags::TestFlag, None, true);
        println!("\nIs flag enabled: {}\n", is_enabled);

        sleep(Duration::from_millis(5000)).await;

        client.stop_poll().await;
        Ok::<(), Box<dyn Error + Send + Sync>>(())
    });

    Ok(())
}
```
---
```rust
let api_token = env::var("UNLEASH_API_TOKEN").expect("UNLEASH_API_TOKEN environment variable not set");

let client: Client<Flags, reqwest::Client> = ClientBuilder::default()
    .into_client(
        "<YOUR_API_URL>",
        "unleash-onboarding-rust",
        "unleash-onboarding-instance",
        Some(api_token.to_owned()),
    )?;
client.register().await?;
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-client-rust)
- [Rust example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Rust)
- [How to Implement Feature Flags in Rust](https://docs.getunleash.io/feature-flag-tutorials/rust)
