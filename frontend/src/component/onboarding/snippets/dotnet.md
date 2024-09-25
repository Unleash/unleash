1\. Install the SDK
```sh
dotnet add package unleash.client
// If you do not have a json library in your project:
dotnet add package Newtonsoft.Json
```

2\. Initialize Unleash
```csharp
using System;
using Unleash;
using Unleash.ClientFactory;
using System.Collections.Generic;
using System.Threading.Tasks;

public class Program
{
    public static async Task Main()
    {
        var settings = new UnleashSettings()
        {
            AppName = "codesandbox-csharp",
            UnleashApi = new Uri("<YOUR_API_URL>"),
            SendMetricsInterval = TimeSpan.FromSeconds(1),
            CustomHttpHeaders = new Dictionary<string, string>()
            {
                {"Authorization", "<YOUR_API_TOKEN>"}
            }
        };

        var unleash =  new DefaultUnleash(settings);
        var flag = "example-flag";

        while (true) {
            Console.WriteLine($"'{flag}' is enabled: {unleash.IsEnabled(flag)}");
            await Task.Delay(1000);
        }
    }
}
```
