<!--
Author(s): Mark Fulton
Reviewer(s): Thomas, Mike Vitteglio, Sebastian Bury

Resources (remove before publication)

- [Diataxis/](https://diataxis.fr/tutorials/)
- [Unleash Docs GH](https://github.com/Unleash/unleash/tree/main/website/docs)
- [Unleash QSG](https://github.com/Unleash/unleash/blob/main/website/docs/tutorials/quickstart.md?plain=1)
-->

---
title: Demo Application Tutorial - DRAFT - WiP
---

# Introduction

This tutorial will guide you through the process of setting up a demo web application with working feature toggles provided by an Unleash instance.  
In a short period of time, it will demonstrate the power of Unleash as a runtime control mechanism to control the state of software while not being bound by release and deploy processes.  

Specifically, you will learn:

- Using Next.js, how to incorporate Unleash client (frontend) and server-side (backend) SDKs into the application source code
- On the Unleash instance, configuring a project for the application and assign to an environment
- Setup appropriate tokens for the application feature toggles
- See feature toggles in action!

These basic principles could then be transpired to other applications to help you get up and running with Unleash.
Please take note of the next Prerequisites section before beginning the deployment steps. *Estimated time burden is around 30 minutes* once dependencies are met.

**Note: The tutorial does not cover the deployment of a local Unleash instance.** If you don't yet have access to an Unleash instance, please consult the next topic for guidance on setting one up for free.  


# Prerequisites

In this section, we will take care of all relevant technical prerequisites required to complete a successful demo lab deployment.

## Unleash

Most critically, we'll need an accessible Unleash instance. In the simplest terms, this can be a free *self-hosted dockerized instance*, or *hosted*, where a [14 day trial](https://www.getunleash.io/pro_signup/) option is available. The [Quick Start Guide](https://github.com/Unleash/unleash/blob/main/website/docs/tutorials/quickstart.md?plain=1) covers how to setup an open source, local instance through docker.

## Container Runtime

The demo application will be run locally, using docker compose. Therefore, a container runtime and docker CLI tools (including docker-compose) are required.
[Colima](https://github.com/abiosoft/colima) is an open-source container runtime with minimal setup that works on macOS and Linux.
Docker Desktop is a non-OSS option which includes a UI.

## Tools

Finally, be sure git tools are available on your local machines terminal.


# Deployment and Configuration

Once the prereqs have been met, we can move forward with deployment and configuration. Get your terminal ready and let's begin!

## Source Cloning

1. The source files for the lab are hosted at the following repo: https://github.com/Mohawk-Valley-Interactive/nextjs-unleash-demo  
   
Go ahead and clone these:

```sh
git clone https://github.com/Mohawk-Valley-Interactive/nextjs-unleash-demo
```

<!-- CAUTION: Application source is not distributed under an OSS license. Mike V to update this with an version of the app with OSS components -->

2. Afterwards, open up the `docker-compose.yml` in the root folder.  
Below is an example:

```yaml
version: '3.4'

services:
  nextjs_material:
    image: unleash/nextjs_material
    build:
      context: .
      dockerfile: ./Dockerfile
    environment:
      NODE_ENV: development
      UNLEASH_SERVER_API_URL: 'https://us.app.unleash-hosted.com/ushosted/api/'
      UNLEASH_SERVER_API_TOKEN: '<INSERT_SERVER_API_TOKEN>'
      UNLEASH_FRONTEND_API_URL: 'https://us.app.unleash-hosted.com/ushosted/api/frontend'
      UNLEASH_FRONTEND_API_TOKEN: '<INSERT_FRONTEND_API_TOKEN>'
    ports:
      - 3000:3000
```

3. We will need to work on the five lines in the `environment` section.

Take note of your instance URL endpoints that will go into the `UNLEASH_SERVER_API_URL` and `UNLEASH_FRONTEND_API_URL` fields. The example has our hosted US region prepopulated.  
If using a local instance on port 4242, these would be `http://localhost:4242/api/` and `http://localhost:4242/api/frontend` respectively.

## Unleash

Next, we will need to switch over to our Unleash instance and create a project for the demo app, assign it to an environment (if more than one are setup) and create our feature toggles. Then, we will create two API keys - one frontend, for our *client-side* feature toggles, and one backend, for our *server-side* toggles.

Step by step:

### Create a Project

After logging in, click on *Projects* in the top toolbar, then New project. Give it an ID and name of choice (both can be the same), and save.

![Here, we are using `Demo-Intro` as name and projectID.](/img/tutorial-appdemo-create-project.png)


### Create Feature Toggles

Now navigate to the new project page.

Create four feature toggles with the following names:

- **demo-bankingDemo**
- **demo-featured_app**
- **demo-analyticsCards**
- **demo-specialCustomer**

For each toggle, use the **Kill-switch toggle type** and enable **Impression data**. <!-- Add Screenshot -->

### Assign to an Environment

If you are using Unleash 4.3 or above, you'll have a selection of environments to choose from for the feature toggles.
In this example, we are choosing to use the `Development` environment. Take note of this for next steps.
If you are in Unleash 4.2 or below, this section will not apply.

### Create Tokens

Now we will create the needed two API tokens. In the Unleash UI, switch over to *Configure -> API access*.

Create one *Server-side SDK (CLIENT)* token type, and assign it to the project we created earlier. Select the environment of choice, if applicable.
Finally, create the *Client-side SDK (FRONTEND)* token using the same additional parameters.

The UI will display the token after each creation. **Take note of this**.

We're done in Unleash for now, but keep the browser tab open.


## Source Configuration

At this point we have everything we need to setup our `docker-compose.yml` file. Open up the file in an editor of choice, and substitute the values accordingly.

Be sure tokens are pasted in the correct format and character spacing are valid.

Below is a format example of a completed `environment` section:

```yaml
    environment:
      NODE_ENV: development
      UNLEASH_SERVER_API_URL: 'https://us.app.unleash-hosted.com/ushosted/api/'
      UNLEASH_SERVER_API_TOKEN: 'Demo-Intro:development.404843b76e84670d639b6f04ff1155c231xxyc8b1b8a42b4a7296abc'
      UNLEASH_FRONTEND_API_URL: 'https://us.app.unleash-hosted.com/ushosted/api/frontend'
      UNLEASH_FRONTEND_API_TOKEN: 'Demo-Intro:development.a4c21f7b5c234d12a08eff3659a549390f1e41a879b0531777bfabcd'
```


We're now ready to deploy!


## Deployment

### Deploy container

From a terminal, simply execute:

```sh
docker compose up
```

The application container image will be built and run. If successful, you should see the following:

```
Attaching to nextjs-unleash-demo-nextjs_material-1
nextjs-unleash-demo-nextjs_material-1  | 
nextjs-unleash-demo-nextjs_material-1  | > @minimal/material-kit-nextjs@3.0.0 start
nextjs-unleash-demo-nextjs_material-1  | > next start
nextjs-unleash-demo-nextjs_material-1  | 
nextjs-unleash-demo-nextjs_material-1  | ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```


### Validate and Login

Open `http://localhost:3000` in a browser. Click the *Live Preview* button and sign in with the displayed credentials:  

```
user: demo@minimals.cc
password : demo1234
```

A dashboard should load. We're ready to go!

:::tip Errors?
If you see an Internal Server Error or a different response from the browser, something has gone wrong. Double check the console output as well as the environment variables in the docker compose file.
:::

# Feature Flags In Action

Although totally transparent to the end user visiting the website, we need to distinguish between client (frontend) and server (backend) feature flags to gain an understanding of how they work and operate in code.

The app is setup for three client side toggles, and one server side toggle. In this section we'll review the UX impact of enabling/disabling each of the flags in turn.

To prepare, open the Unleash project and the application UI side-by-side. 
As we are using the *Development* environment, these are the UI toggles for the feature flags we will be using.

<!-- Add Screenshot -->

## Client-side Feature Flags

<!-- Add info on use-cases -->

### Banking feature

Enable the toggle for feature `demo-bankingDemo`. Notice how now a new *Banking* feature has been added to the sidebar underneath Analytics!  <!-- Add Screenshot -->

Click on `Banking` in the navigation menu. Notice how the feature is populated. Disable the flag - this now switches to a *Coming Soon* message.

### Special Customer

In the UI, navigate to *Management -> E-Commerce -> Shop*. Enable the toggle for feature `demo-specialCustomer` . 
Notice how cards are updated with *Special Access Granted* and a *Premium Customer* note appears at the top. <!-- Add Screenshot -->

### Analytics Cards

Navigate to *General -> Analytics* from the main demo app window. Enable the toggle for feature `demo-analyticsCards` . Note how a row of analytics cards now shows from above. <!-- Add Screenshot -->

## Server-side Feature Flags

### Featured App

Navigate to *General -> App* from the main demo app window. Enable the toggle for feature `demo-featured_app` and reload the page using the browser controls.

***tip Reload
In contrast to the client side flags, this one requires you to reload the browser of the page to see the difference. This is because the toggle operates on the backend of the web app, therefore the client needs to retrieve the page again to see it.  <!-- Add Screenshot -->
***

Notice that we now see a *Featured App* card appear on the UI.
Disabled it again, and it will no longer show on the next reload.


# SDK Integration - A Closer Look

Now that we've seen the feature toggles and their underlying use cases in action, let's investigate how they operate behind the scenes in the source code.
The key objective of this final topic is to help understand how you would implement this into your own application.

We start with the Unleash [https://docs.getunleash.io/reference/sdks/next-js](Next.js SDK documentation) - open up this page where we'll review the Installation and Environment variables.

First of all, to prepare the environment, the SDK will be installed from the package manager of choice (npm, yarn, pnpm).  

Now see the section on `Environment Variables` - observe how these match the contents of our `docker-compose.yml` which sets these up inside the application container.

Then, there are specific steps for the Client side and Server side use cases. Let's investigate each of these.


## Client SDK

1) Read through the section on `Client side only` in the SDK doc. Now we'll see where we placed the code snippets in our example app to connect the front-end to Unleash.

2) Inspect the file `./src/pages/_app.js`
All the web UI components read from this in the first instance.

Note the lines and those immediately below it matching the SDK doc syntax:

```javascript
import { FlagProvider } from '@unleash/nextjs';`
```

```javascript
<FlagProvider
        config={{
          refreshInterval: 1,
          clientKey: unleashClient.current.key,
          url: unleashClient.current.url,
        }}
```

3) Next, we move on to the code for the UI pages themselves which will use hooks to block client side rendering until flags are enabled or ready. Each of these apply the code in a similar manner, so we'll look at one example, the *Banking* , or `demo-bankingDemo` feature toggle.  


We'll review `./src/components/nav-section/vertical/index.js` and `./src/pages/dashboard/banking.js`

### index.js

In `index.js`, note the hook referenced at the top:

```
import { useFlag } from '@unleash/nextjs'
```

And thereafter, an `if` statement for our feature flag:

```javascript
export default function NavSectionVertical({ navConfig, isCollapse = false, ...other }) {
  const isBankingEnabled = useFlag('demo-bankingDemo');

  return (
    <Box {...other}>
      {navConfig.map((group) => (
        <List key={group.subheader} disablePadding sx={{ px: 2 }}>
          <ListSubheaderStyle
            sx={{
              ...(isCollapse && {
                opacity: 0,
              }),
            }}
          >
            {group.subheader}
          </ListSubheaderStyle>

          {group.items.map((list) => {
            if (group.subheader === 'general' && list.title === 'banking' && !isBankingEnabled) {
              return <></>;
            }

            return <NavListRoot key={list.title} list={list} isCollapse={isCollapse} />;
          })}
        </List>
      ))}
    </Box>
  );
}
```

### banking.js

In `banking.js`, also note the same hook referenced at the top:

```javascript
import { useFlag } from '@unleash/nextjs';
```

We begin the conditional context of our feature flag here:

```javascript
const isBankingEnabled = useFlag('demo-bankingDemo');
```

First, behavior to populate the feature or page contents if the flag is enabled:

```javascript
return (
    <Page title="General: Banking">
      {isBankingEnabled ? (
        <Container maxWidth={themeStretch ? false : 'xl'}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <BankingWidgetSummary
                  title="Income"
                  icon={'eva:diagonal-arrow-left-down-fill'}
                  percent={2.6}
                  total={18765}
                  chartData={[111, 136, 76, 108, 74, 54, 57, 84]}
                />
                <BankingWidgetSummary
                  title="Expenses"
                  color="warning"
                  icon={'eva:diagonal-arrow-right-up-fill'}
                  percent={-0.5}
                  total={8938}
                  chartData={[111, 136, 76, 108, 74, 54, 57, 84]}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <BankingCurrentBalance />
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <BankingBalanceStatistics />
                <BankingExpensesCategories />
                <BankingRecentTransitions />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <BankingQuickTransfer />
                <BankingContacts />
                <BankingInviteFriends />
              </Stack>
            </Grid>
          </Grid>
        </Container>
```

And to finish, content to load if the flag is disabled:

```javascript
      ) : (
        <p>Coming soon!</p>
      )}
    </Page>
  );
```

:::info For Reference
Optionally, in case you want to inspect the syntax application of the other files we touched to bring in feature flags:

- For `demo-analyticsCards`, review `./src/pages/dashboard/analytics.js`  
- For `demo-specialCustomer`, review `./src/pages/dashboard/e-commerce/shop.js` and `./src/sections/@dashboard/e-commerce/shop/ShopProductCard.js`
:::

## Server SDK

Review the section on Server Side Rendering (SSR) in the SDK doc. Now we'll see where we placed the code snippets in our example app to connect the backend to Unleash.  

1) For reference, our feature flag for this use case is `demo-featured_app`. The file we'll want to review is `/src/pages/dashboard/app.js` - open this up.

2) We can see the hook added for feature flags towards the beginning:

```javascript
import { evaluateFlags, flagsClient, getDefinitions, getFrontendFlags } from '@unleash/nextjs';
```

3) From the SDK, we obtain the users sessionId and the status of the `demo-featured_app` feature flag:  

```javascript
export async function getServerSideProps(ctx) {
  const sessionId = ctx.req.cookies['unleash-session-id'] || `${Math.floor(Math.random() * 1_000_000_000)}`;
  ctx.res.setHeader('set-cookie', `unleash-session-id=${sessionId}; path=/;`);

  const context = {
    sessionId, // needed for stickiness
    // userId: "123" // etc
  };
  const { toggles } = await getFrontendFlags({ context });
  const flags = flagsClient(toggles);

  return {
    props: {
      isFeaturedAppEnabled: flags.isEnabled('demo-featured_app'),
    },
  };
}
```

4) Finally, the code snippet that will be served if the feature flag is enabled:  

```javascript
export default function GeneralApp({ isFeaturedAppEnabled }) {
  const { user } = useAuth();
  const theme = useTheme();
  const { themeStretch } = useSettings();

  return (
    <Page title="General: App">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={3}>
          {isFeaturedAppEnabled ? (
            <>
              <Grid item xs={12} md={8}>
                <AppWelcome displayName={user?.displayName} />
              </Grid>

              <Grid item xs={12} md={4}>
                <AppFeatured />
              </Grid>
            </>
          ) : (
            <></>
          )}

          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="Total Active Users"
              percent={2.6}
              total={18765}
              chartColor={theme.palette.primary.main}
              chartData={[5, 18, 12, 51, 68, 11, 39, 37, 27, 20]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="Total Installed"
              percent={0.2}
              total={4876}
              chartColor={theme.palette.chart.blue[0]}
              chartData={[20, 41, 63, 33, 28, 35, 50, 46, 11, 26]}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title="Total Downloads"
              percent={-0.1}
              total={678}
              chartColor={theme.palette.chart.red[0]}
              chartData={[8, 9, 31, 8, 16, 37, 8, 33, 46, 31]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentDownload />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppAreaInstalled />
          </Grid>

          <Grid item xs={12} lg={8}>
            <AppNewInvoice />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AppTopRelated />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTopInstalledCountries />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTopAuthors />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Stack spacing={3}>
              <AppWidget title="Conversion" total={38566} icon={'eva:person-fill'} chartData={48} />
              <AppWidget title="Applications" total={55566} icon={'eva:email-fill'} color="warning" chartData={75} />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
```


## Conclusion


Congratulations! You've seen first hand how to use both a client and server-side SDK to enable feature flags in an application, as well as a diverse set of use cases for them.  

These principles are put into practice when integrating feature toggles into your own applications to allow for more flexibility and faster releases.