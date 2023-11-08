---
title: How to Implement Feature Flags in Flutter using Unleash
---
:::note

This article is a contribution by **[Ayush Bherwani](https://www.linkedin.com/in/ayushbherwani/)** as a part of the **[Community Content Program](https://github.com/unleash/community-content)**. You can also suggest a topic by [opening an issue](https://github.com/Unleash/community-content/issues), or [Write for Unleash](https://www.getunleash.io/blog/get-published-through-unleashs-community-content-program) as a part of the Community Content Program.

:::


I’m a software developer. My team uses both Unleash and Flutter to publish our app on mobile platforms.

Let’s talk about how you could use [feature flags](https://www.getunleash.io/blog/what-are-feature-flags) in Flutter to ship applications more efficiently. 

![Using Unleash with flutter lets you use feature flags with your mobile apps.](/img/unleash-flutter-architecture.png)

## How to set up Unleash

If you haven’t already, you should start by setting up Unleash. It’s pretty simple. Make sure you install [Git](https://github.com/git-guides/install-git) and [Docker](https://www.docker.com/) first. 

Head to Unleash’s [documentation](https://github.com/Unleash/unleash#get-started-in-2-steps) for more on setting up Unleash.

## Integrating Unleash in Flutter

Now that we have created our Unleash instance, let’s dive into integrating our first feature flag in Flutter.

For this article we’ll integrate feature flags into one of my demo applications. The application is quite simple, and showcases the use of the Unsplash API.

Here’s a screenshot:

![For this demo of Flutter with Unleash, we'll be using Unsplash](/img/flutter-unleash-demo.png)
 

Let’s quickly enable and disable the image details page. You’ll do this through toggling a feature flag in Unleash. 

You’ll be able to control behavior through an Unleash instance without making any changes to the code.

In your Unleash instance, create a new feature flag called “isImageDetailsEnabled”.

By default, set the flag to “false,” which means the Image details feature will be disabled.  Choose the toggle type called “Release”.

![Set your feature flag to false, and choose the toggle type "release."](/img/feature-flag-release.png)

For the implementation, you’ll use the “unleash_proxy_client_flutter” package. This package facilitates integration with Unleash. This way you can easily manage feature flag behavior in your Flutter application.

To install the “unleash_proxy_client_flutter” package, you have two options. You can either manually add the package in the `pubspec.yaml` file, or you can use the `flutter pub add` command.

```
# For manually adding package to pubspec.yaml

dependencies:
  unleash_proxy_client_flutter: ^1.3.0
```

```
// Using flutter pub add command
flutter pub add unleash_proxy_client_flutter
```

After successfully installing the package, the next step is to initialize Unleash in your Flutter app. This sets up the necessary configurations using [API tokens](https://docs.getunleash.io/how-to/how-to-create-api-tokens) and prepares Unleash for [feature flag management](https://www.getunleash.io/feature-management).

Given that the project follows clean architecture and Test-Driven Development (TDD) principles, you’ll want to create an abstract layer to interact with the Unleash client.

```
import 'package:unleash_proxy_client_flutter/unleash_proxy_client_flutter.dart';


const String isImageDetailsEnabledToggleKey = "isImageDetailsEnabled";


abstract class UnleashConfig {
 /// Flag that will be used to control the image details feature in the app
 bool get isDetailsPageEnabled;
}


class UnleashConfigImpl extends UnleashConfig {
 final UnleashClient unleash;


 UnleashConfigImpl(this.unleash);


 @override
 bool get isDetailsPageEnabled =>
     unleash.isEnabled(isImageDetailsEnabledToggleKey);
}

```

This abstraction will help you easily test Unleash functionalities while isolated from the rest of the application.

Once you have your configuration in place, the next step is to create the `UnleashClient` and add it to our service locator class, along with our `UnleashConfig`.

 ```
 import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get_it/get_it.dart';
import 'package:unleash_proxy_client_flutter/unleash_proxy_client_flutter.dart';
import 'package:unplash_sample/core/config/unleash_config.dart';
class DependencyInjection {
 DependencyInjection._();


 static GetIt get getIt => GetIt.instance;


 static Future<void> initialize() async {
   /// ...
   final unleash = UnleashClient(
     /// URL of the unleash instance
     url: Uri.parse('http://127.0.0.1:4242/api/frontend'),
     /// API token for FRONTEND
     clientKey: dotenv.env["UNLEASH_API_KEY"] as String,
     appName: 'unplash_demo',
     /// Interval for refreshing, default is 30 seconds.
     refreshInterval: 5
   );


   await unleash.start();
   
   getIt.registerLazySingleton(() => unleash);
   getIt.registerLazySingleton<UnleashConfig>(() => UnleashConfigImpl(getIt()));
 }
}
 ```

To display the image on the screen, you should utilize the custom `ImageTile` widget. You’ll then make adjustments to the widget using the `UnleashConfig` in order to navigate to the “ImageDetailsPage.”

This way you’ll enable dynamic navigation based on the flag’s status. Your users will thank you for it. 

```
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:unplash_sample/core/config/unleash_config.dart';
import 'package:unplash_sample/features/home/domain/entities/image.dart';
import 'package:unplash_sample/features/image_details/presentation/pages/image_details_page.dart';


class ImageTile extends StatelessWidget {
 final UnsplashImage image;
 final UnleashConfig unleashConfig;


 const ImageTile({
   super.key,
   required this.image,
   required this.unleashConfig,
 });


 @override
 Widget build(BuildContext context) {
   return GestureDetector(
     onTap: () {
       // Navigate to the details page if the feature is enabled
       if (unleashConfig.isDetailsPageEnabled) {
         Navigator.of(context).push(
           MaterialPageRoute<ImageDetailsPage>(builder: (context) {
             return ImageDetailsPage(id: image.id);
           }),
         );
       }
     },
     child: Container(
       margin: const EdgeInsets.all(4),
       child: CachedNetworkImage(
         imageUrl: image.url,
         fit: BoxFit.fill,
       ),
     ),
   );
 }
}
```
 

Here you’ll enable the flag “isImageDetailsEnabled” within Unleash, then activate your image details feature in the application.

Voila! You’ve activated your desired functionality. You’ve also made sure that users can access image details depending on the state of the flag.  

See Flutter and Unleash in action:
![See Flutter and Unleash in action.](/img/Unsplash-and-Unleash-Flutter-Demo.gif)

## Conclusion

Feature management is a way to develop software that gives a lot of flexibility and control when incorporated in Flutter.

With Unleash integrated into Flutter, you can do things like:
- Tailor onboarding experiences
- Orchestrate time-limited in-app offers,
- Optimize a release pipeline

Your team can also use Flutter and Unleash to test different versions with diverse groups of users. This is a great way to gain insightful user metrics about a feature before rolling it out to a larger audience. It also makes your releases a lot less risky.

For instance, you can use A/B testing to test different search bar positions in the Unsplash sample app. You can then use metrics from your users to decide which position to keep.

Some [best practices](/topics/feature-flags/feature-flag-best-practices) include setting up a clean and manageable codebase, while developing proper naming conventions for your flags. 

Make sure to revisit your flags from time to time. You should remove obsolete flags to keep your code clean and avoid [technical debt](https://www.getunleash.io/blog/what-is-technical-debt).

That’s it for today. I hope you found this helpful. If you’re just getting started with feature flagging with Flutter and Unleash, I think you’ll really enjoy your journey.

Want to deep dive into the code used for this article? It’s all on [GitHub](https://github.com/AyushBherwani1998/unsplash_sample/tree/unleash/feature-flagging).