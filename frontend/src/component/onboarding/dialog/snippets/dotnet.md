1\. Install the SDK
```sh
dotnet add package unleash.client
// If you do not have a json library in your project:
dotnet add package Newtonsoft.Json
```

2\. Initialize Unleash
```csharp
using Unleash;
using Unleash.ClientFactory;

public class Program
{
    public static async Task Main()
    {
        var settings = new UnleashSettings()
        {
            AppName = "unleash-onboarding-dotnet",
            UnleashApi = new Uri("<YOUR_API_URL>"),
            SendMetricsInterval = TimeSpan.FromSeconds(1),
            CustomHttpHeaders = new Dictionary<string, string>()
            {
                {"Authorization","<YOUR_API_TOKEN>"}
            }
        };

        var unleash =  new DefaultUnleash(settings);

        while (true) {
            Console.WriteLine($"Flag is enabled: {unleash.IsEnabled("<YOUR_FLAG>")}");
            await Task.Delay(1000);
        }
    }
}

```

---
```csharp
var settings = new UnleashSettings()
{
    AppName = "unleash-onboarding-dotnet",
    UnleashApi = new Uri("<YOUR_API_URL>"),
    CustomHttpHeaders = new Dictionary<string, string>()
    {
        {"Authorization",Environment.GetEnvironmentVariable("UNLEASH_API_KEY")}
    }
};
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-client-dotnet)
- [.NET/C# SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Csharp)
