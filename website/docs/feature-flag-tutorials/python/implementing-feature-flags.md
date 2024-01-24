---
title: How to Implement Feature Flags in Python
slug: /feature-flag-tutorials/python
---

[Python](https://www.python.org/) is a popular programming language used for a variety of software applications and services. It is supported widely in the developer community and is known for being intuitive, readable, and friendly to new and experienced developers.

Leveraging feature flags allows developers to toggle new features on and off, whether you’re experimenting in your local environment, testing for QA purposes, or rolling out changes to users in production. Feature flags play a critical role in optimizing the entire software development lifecycle. With Unleash, an open-source feature flag service, you can use our tooling to implement feature flags into your application and release new features faster, strategically, and safely. But how can you do this in Python?

[Flask Surveys Container App](https://github.com/pamelafox/flask-surveys-container-app) is an example Python application using [Flask](https://flask.palletsprojects.com/en/3.0.x/) and [SQLAlchemy](https://www.sqlalchemy.org/) to create and store surveys. Flask is a Python framework that provides out-of-the-box configurations to get the shell of a full-stack web application up and running, which includes [Jinja](https://jinja.palletsprojects.com/en/3.1.x/) for building web page HTML templates served using Python routing. This sample app is containerized, meaning you won’t have to rely on your system’s configurations of different libraries and tools used to allow the app to run successfully. It’s wrapped in a Docker container that will install and run the app in isolation.

![A screenshot of the Flask Surveys Container App](/img/python-tutorial-survey-example.png)

In this tutorial, you will learn how to set up and use Python feature flags with Unleash. We will use the Flask Surveys container app to implement the feature flag solution, which will roll out a feature that allows users to delete surveys they create.

At the end of this tutorial, you will be able to turn on the feature flag and activate a route that will remove surveys from the database.

Here are the steps we will cover in this tutorial:
1. [Feature flag best practices for back-end applications](#1-unleash-best-practice-for-backend-apps)
2. [Spin up a local flag provider](#2-install-a-local-feature-flag-provider)
3. [Configure a feature flag](#3-create-and-configure-the-feature-flag)
4. [Add Unleash to a Python Flask app](#4-add-unleash-to-a-python-app)
5. [Toggle the database deletion route](#5-use-a-feature-flag-to-roll-out-a-delete-method)
6. [Verify the toggle experience](#6-verify-the-toggle-experience)
7. [Improve feature flag error handling](#7-improve-a-feature-flag-implementation-with-error-handling)


## Prerequisites


In this tutorial, you will need the following:
- A web browser like Chrome or Firefox
- Git
- Docker
- (Optional) a code editor like Visual Studio Code


![An architectural diagram of our Python app using Unleash feature flags](/img/python-flask-unleash-architecture.png)


This architecture diagram breaks down how the Python app works with Unleash to control feature flags.

Your Python app is an **Evaluation Service**, which is meant to evaluate feature flags and pass evaluated results down to the SDK in the client application. In this context, the results will be passed to the Python SDK. 

The Unleash Server is a **Feature Flag Control Service**, which is a service that manages your feature flags and is used to retrieve flag data from (and send data to, especially when not using a UI). The Unleash server has a UI for creating and managing projects and feature flags. There are also [API commands available in our documentation](https://docs.getunleash.io/reference/api/unleash) to perform the same actions straight from your CLI or server-side app.

An Evaluation Service and a Feature Flag Control Service work hand in hand for you to leverage feature flags. For this tutorial, we will be using both to toggle extended functionality for surveys hosted in the Python app database.


## 1. Unleash best practice for backend apps

Since Python is a backend language, there are special security considerations to plan around when implementing feature flags.

Most importantly, you must:

- Limit feature flag payloads for scalability, security, and efficiency
- Improve architectural resiliency with graceful degradation

As your application scales, performance and resiliency become more critical and costly if not addressed. A feature flagging system should not be the reason your app slows down or fails. That’s why we recommend you account for this by reducing the size of your feature flag payloads. For example, instead of making one large call to retrieve flag statuses for all users as part of your configuration, group your users by specific attributes as part of your targeting rules that would be most relevant for your application.

Additionally, you can cache your feature flag configuration to help reduce network round trips and dependency on external services. You can rely on the cache if your Feature Flag Control Service is not available, which will mitigate potential failure in your application.

For a complete list of architectural guidelines, see our [best practices for building and scaling feature flag systems](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices).


## 2. Install a local feature flag provider


There are many feature flag tools available. In this section, you will install Unleash, run the instance locally, log in, and create a feature flag, but you can use other tools in place of Unleash if you prefer. You’ll need to edit the code accordingly, but the basic steps will probably be the same.

Use Git to clone the Unleash repository and Docker to build and run it. Open a terminal window and run the following commands:

```
git clone git@github.com:Unleash/unleash.git
cd unleash
docker compose up -d
```

You will now have Unleash installed onto your machine and running in the background. You can access this instance in your web browser at http://localhost:4242

Log in to the platform using these credentials:

```
Username: admin
Password: unleash4all
```

Click the ‘New feature toggle’ button to create a new feature flag. Once you have created a flag, you will see it here.


![Image of the Unleash platform to create a new feature flag](/img/python-tutorial-create-flag.png)


## 3. Create and configure the feature flag


Next, you will create a feature flag and turn it on for your Python app.

In the Create Toggle view, give your feature flag a unique name and click ‘Create toggle feature’.

For the purpose of this tutorial, name the feature flag `delete_survey_flag`. Use the default values in the rest of the feature flag form.


![Image of a feature flag form](/img/python-tutorial-feature-flag-form.png)


Your new feature flag has been created and is ready to be used. Enable the flag for your development environment, which makes it accessible for use in the Python app we will clone into your local environment.


![Image of the enabled Python flag in development environment](/img/python-tutorial-enabled-flag.png)

Next, generate an API token to authenticate calls made to Unleash servers from your project. This API token will eventually be pulled into a configuration object within your Python application to toggle features. 

> **Note** We require an API token as part of your flag configuration to ensure that only applications with the correct authentication can access your feature flags in Unleash. API tokens are created by users with API management access and thus controls how they can be distributed to applications that need it, and by whom.

From your project view on the platform, go to "Project Settings" and then "API Access".

Select the ‘New API token’ button.


![Image of the API token button in API Access view](/img/python-tutorial-create-api-token.png)


Name the API token and select the “Server-side SDK” token type, since we’ll be doing our flag evaluation on the server using the Python SDK. You can read more about [Unleash API tokens in our documentation](https://docs.getunleash.io/reference/api-tokens-and-client-keys#client-tokens).

The token should have access to the “development” environment, as shown in the platform screenshot below.


![Image of the API token creation form](/img/python-tutorial-create-api-token-form.png)


The API token you generated can be managed in the API Access view in your project settings. It will become handy in Step 4.


## 4. Add Unleash to a Python app

In this section, you will clone an open-source Python application called [Flask Surveys Containers app](https://github.com/pamelafox/flask-surveys-container-app), which we are using to model a service that provides routing, serves HTML pages, and performs actions against a database. This app uses Flask, SQLAlchemy, and a PostgreSQL database.

Use this command to clone the repository via your Terminal:

```
git clone git@github.com:pamelafox/flask-surveys-container-app.git
```

Next, navigate into your repository directory and create a `.env` file.

Copy this code snippet into your `.env` file:


```py
FLASK_DEBUG=True
DBHOST=db
DBNAME=postgres
DBUSER=app_user
DBPASS=app_password
```


Next, install the Python SDK. Open your repository in a code editor and navigate to `requirements.txt` inside the `src` folder. Reference the Python SDK for installation.


```py
UnleashClient==5.11.1
```


In `src/backend/__init__.py`, import UnleashClient:


```py
from UnleashClient import UnleashClient
```


In the same file, call the Unleash client for initialization when the app runs with this code snippet:


```py
client = UnleashClient(
 	url="http://host.docker.internal:4242/api",
    app_name="flask-surveys-container-app",
 	custom_headers={'Authorization': '<API token>'})
 
client.initialize_client()
```

The URL will point your app to your Unleash instance through your Docker container for server-side communication.

Replace the `<API token>` string in the Authorization header with the API token we created on our Unleash instance. This will allow the app to communicate with the Unleash API to use the feature flag we created.

You can check our [API token and client keys documentation](https://docs.getunleash.io/reference/api-tokens-and-client-keys) for more specifics and see additional use cases in our [Server-Side SDK with Python](https://docs.getunleash.io/reference/sdks/python) documentation.

Next, go to your terminal and build the app using this command:


```
docker-compose up --build
```


Navigate to [localhost://50505](http://localhost://50505) and the Surveys list should eventually display:


![Image of Surveys app loaded in browser](/img/python-tutorial-surveys-app-loaded.png)


Create 1 or more new surveys so they’re populated in your database!

## 5. Use a feature flag to roll out a delete method

In a real-world use case for your feature flag, you can gradually roll out new features to a percentage of users by configuring the flag's strategy.

In this case, our app currently supports creating a survey, but once we create one, we can’t get rid of it. We want to roll out a ‘delete’ button in our list of surveys so we have the option to remove them from our database. 

This will require us to:
- Create a new route in our app
- Create a method that deletes a survey based on survey ID
- Create a delete button
- Map the delete button to the delete method

In `src/backend/surveys/routes.py`, add `client` to the existing `backend` import statement. The full import line will now look like this:


```py
from backend import db, client
```

We’ve imported the initialized Unleash client into `routes.py`. Now we can use that data to pass into the `surveys_list_page` method. This will allow us to check the status of the enabled flag to conditionally render the 'Delete' button on the surveys page.

Add `client` as a parameter in the template that we return in the `surveys_list_page` method.

The modified return statement in this method will now look like this:

```py
return render_template("surveys_list.html", surveys=surveys, client=client)
```

In the same file, we will create a new route and a ‘delete’ method with this code snippet:

```py
@bp.route("/surveys/<int:survey_id>/delete", methods=["GET", "POST", "DELETE"])
def delete_survey(survey_id):
   survey = db.get_or_404(Survey, survey_id)
   db.session.delete(survey)
   db.session.commit()

   return redirect(url_for("surveys.surveys_list_page"))
```

The server now has a route that uses a survey ID to locate the survey in the database and delete it.

To make calls to this route, we will create a delete button for each survey on the page.

In `src/backend/templates/surveys_list.html`, add the following code to your survey table underneath the “Survey Page” button:

```html
{% if client.is_enabled('delete_survey_flag') %}
<td class="text-end"><a href="{{ url_for('surveys.delete_survey', survey_id=survey.id) }}" class="btn btn-sm btn-danger">Delete</a></td>
{% endif %}
```

This code wraps a delete button in a conditional statement that checks whether or not the feature flag is enabled. This button has a link that points to the `delete_survey` method we created, which will pull in the survey using an ID to search the database, find the matching survey, and delete it from the database session.

Your surveys page will now look something like this:


![Screenshot of app in browser with delete buttons in survey table](/img/python-tutorial-surveys-with-delete.png)


Test the new functionality by deleting one of your surveys. The page should refresh without the survey you deleted.


## 6. Verify the toggle experience


Now that we’ve added in new functionality and connected it to our feature flag, we can verify that if you disable the flag in your development environment, your Python app will no longer serve an HTML page with the option to delete surveys you’ve created.

In your local Unleash instance, turn off the feature flag by disabling it in the development environment.

![Image of feature flag with a disabled environment](/img/python-tutorial-disabled-flag.png)

Next, return to your Survey app and refresh the browser. With the flag disabled, the Delete button will no longer be visible.

![Screenshot of app in browser without delete buttons for surveys](/img/python-tutorial-surveys-without-delete.png)


## 7. Improve a feature flag implementation with error handling

If you turn the feature flag off, you won’t be able to use the delete button to remove a survey from your list. However, if a user wanted to bypass the UI to delete a survey, they could still use the URL from the delete method route to target a survey and delete it.

You could do this by entering in a URL like this to the browser:

[http://localhost:50505/surveys/2/delete](http://localhost:50505/surveys/2/delete)

They could do this because we have committed code that is only _partially_ hidden behind a feature flag. The HTML code is behind the flag, but the server method that it talks to is not.

In a real world application, ignoring this would cause a user to perform an action they _shouldn’t_ able to. Luckily, we can use a feature flag to stop the delete method from being called manually.

Let’s walk through how to gracefully handle this scenario:

We need an error handler route to return a simple 404 page to stop a user from being able to manually delete a survey when the flag is off.

In your `routes.py` file, import two more modules from Flask that will support our error handling function: [`abort`](https://flask.palletsprojects.com/en/3.0.x/api/#flask.abort) and [`jsonify`](https://flask.palletsprojects.com/en/3.0.x/api/#flask.json.jsonify).

Line 1 will now look like this:

```py
from flask import redirect, render_template, request, url_for, abort, jsonify
```

Next, add in the following error handling method at the bottom of the file:

```py
@bp.errorhandler(404)
def resource_not_found(e):
   return jsonify(error=str(e)), 404
```

In order to render the error message, we can call it from the `delete_survey` method only in the case that the feature flag is turned off. Here’s how the updated `delete_survey` code would look like:

```py
@bp.route("/surveys/<int:survey_id>/delete", methods=["GET", "POST", "DELETE"])
def delete_survey(survey_id):
   if client.is_enabled('delete_survey_flag'):
       survey = db.get_or_404(Survey, survey_id)
       db.session.delete(survey)
       db.session.commit()

       return redirect(url_for("surveys.surveys_list_page"))
   else:
       abort(404, description="Resource not found")
```

Now, if you turn off the flag in your Unleash instance and attempt to delete a survey directly with a URL like [http://localhost:50505/surveys/2/delete](http://localhost:50505/surveys/2/delete), the 404 error will return.

![Screenshot of 404 error rendering in browser](/img/python-tutorial-404.png)

You can verify in your network call in the browser that the delete method ran and served the 404 page:

![Screenshot of browser network call log showing 404 error](/img/python-tutorial-404-network-call.png)

Learn more about [Flask Blueprint error handling](https://flask.palletsprojects.com/en/3.0.x/errorhandling/#blueprint-error-handlers).

## Conclusion

In this tutorial, we installed Unleash locally, created a new feature flag, installed Unleash into a Python Flask app, and toggled new functionality that altered a database with a containerized project!
