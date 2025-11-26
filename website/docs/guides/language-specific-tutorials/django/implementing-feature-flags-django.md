---
title: How to Implement Feature Flags in Django
description: "How to use Unleash feature flags with Django."
slug: /guides/implement-feature-flags-in-django
---

Hello! In this tutorial, we’ll show you how to add feature flags to your Django app, using [Unleash](https://www.getunleash.io/) and the official [Unleash Python SDK](/reference/sdks/python). With Unleash, an open-source feature flag service, you can use our tooling to add feature flags to your application and release new features faster.

In a classic tutorial fashion, we’ll add feature flags to a blog app made with Django. We’ll use feature flags to decide how many blog posts to show on the index page.

## Prerequisites

For this tutorial, you'll need the following:

-   Python3.10+
-   Git
-   Docker and Docker Compose

![architecture diagram for our implementation](/img/rails-guide-diagram.png)

The Unleash Server is a **Feature Flag Control Service**, which manages your feature flags and lets you retrieve flag data. Unleash has a UI for creating and managing projects and feature flags. For backend applications or automated scripts, Unleash exposes an [API](/api) defined by an OpenAPI specification, allowing you to perform these actions programmatically.

## 1. Install a local feature flag provider

In this section, we'll install Unleash, run the instance locally, log in, and create a feature flag. If you prefer, you can use other tools instead of Unleash, but you'll need to update the code accordingly. The basic steps will probably be the same.

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

Click the 'New feature flag' button to create a new feature flag.

![Create a new feature flag](/img/ruby-guide-new-ff.png)

Call it `top-3` and enable it in the `development` environment.

![A feature flag called `top-3` is now visible.](/img/rails-guide-enable-ff.png)

Everything's now set up on the Unleash side. Let's set up the Django application.

## 2. Set up the Django app

Let's clone a basic blog repository and get it up and running. We don't want to waste time setting up a Django codebase from scratch.

```sh
git clone https://github.com/alvinometric/django-basic-blog
cd django-basic-blog
```

After that, set up a virtual environment and install Django.

```sh
python3 -m venv venv
source venv/bin/activate
pip install django
```

#### Set up and seed the database

This repository uses SQLite, so no additional dependencies or migrations are required.

```sh
python manage.py loaddata initial_data.json
```

#### Run the server

```sh
python manage.py runserver
```

Go to [http://localhost:8000](http://localhost:8000) and check that you see the following:

![A blog app with a list of posts](/img/rails-guide-blog-app.png)

## 3. Restrict the number of posts

Right now all the blog posts are displayed on the index page. We want to use a feature flag to change that and restrict it to the 3 most recent posts.

Let's create a static boolean flag, for now.

Modify the `post_list` view in `blog/views.py` to look like this:

```python
from django.shortcuts import render
from .models import Post

def post_list(request):
    is_top3 = True
    posts = Post.objects.order_by('-published_date')[:3] if is_top3 else Post.objects.all()
    return render(request, 'blog/post_list.html', {'posts': posts})
```

We're using the flag in the views rather than the template, but you could also do it there. I prefer keeping my template logic as simple as possible.

Reload your browser and you should see only the 3 most recent posts.

## 4. Add Unleash to your Django app

Now, let's connect our project to Unleash so that you can toggle the feature flag at runtime. If you wanted to, you could also do a gradual rollout, and use it for A/B testing or more advanced functionality.

You'll need 2 things:

-   The URL of your Unleash instance's API. It's `http://localhost:4242/api/` for your local version. You'll want to replace it with your remote instance.
-   The API token we created on our Unleash instance.

First, install the `UnleashClient` package:

```sh
pip install UnleashClient
```

Then, create `blog/unleash_client.py`, and add the following:

```python
# You DO NOT want to do this in a production environment
# Rather, you would create a singleton that is shared across your application
from UnleashClient import UnleashClient

unleash_client = UnleashClient(
    url="http://localhost:4242/api/",
    app_name="django-blog",
    custom_headers={'Authorization': '<YOUR_API_TOKEN>'}
)
unleash_client.initialize_client()
```

Then, in `blog/views.py`, update the `post_list` view:

```python
from django.shortcuts import render
from .models import Post
from .unleash_client import unleash_client

def post_list(request):
    if unleash_client.is_enabled("top-3"):
        posts = Post.objects.order_by('-published_date')[:3]
    else:
        posts = Post.objects.order_by('-published_date')
    return render(request, 'blog/post_list.html', {'posts': posts})
```

## 6. Verify the toggle experience

Reload your browser and check that you see three blog posts displayed. Turn off the flag in your Unleash instance and reload the page. You should see all the blog posts again.

See additional use cases in our [Python SDK documentation](/reference/sdks/python).

## Conclusion

All done! Now you know how to add feature flags with Unleash in Django. You've learned how to:

-   Install Unleash
-   Create and enable a feature flag
-   Grab the value of a feature flag with the Python SDK, and use it in a Django app

Thank you for following this tutorial!
