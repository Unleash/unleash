1\. Install the SDK
```sh
dotnet add package unleash.client
// If you do not have a json library in your project:
dotnet add package Newtonsoft.Json
```

2\. Initialize Unleash
```csharp
using Unleash;
var settings = new UnleashSettings()
{
    AppName = "unleash-onboarding-dotnet",
    UnleashApi = new Uri("<YOUR_API_URL>"),
    CustomHttpHeaders = new Dictionary<string, string>()
    {
      {"Authorization","<YOUR_API_TOKEN>" }
    }
};
```
