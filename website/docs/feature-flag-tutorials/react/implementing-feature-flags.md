---
title: How to Implement Feature Flags in React
---

Leveraging feature flags allows you to toggle on and off new features you’re developing, whether you’re experimenting in your local environment, testing for QA purposes, or rolling out to users in production. With Unleash, you can use our tooling to implement feature flags into your application and release new features faster, strategically, and safely. But how can you do this in React?

In this tutorial, you will learn how to set up and use feature flags in a React application. Along the way, you will:

- Spin up a local instance of Unleash
- Create a feature flag
- Create a React app and pull in your feature flag for use


## Prerequisites


In this tutorial, you will need the following:

- A web browser like Chrome or Firefox
- Git
- Docker
- NPM or Yarn to create a React app
- (Optional) A code editor like Visual Studio Code


![React Feature Flag Architecture Diagram](/img/react-tutorial-architecture-diagram.png)


### Install and run Unleash on your local machine


In this section, you will install Unleash in order to run it, log in, and create a feature flag. You will use Git to clone the Unleash repository and Docker to build and run it.

Open a terminal window and run the following commands:

```
git clone git@github.com:Unleash/unleash.git
cd unleash
docker compose up -d
```

You will now have Unleash installed onto your machine and running in the background.
You can access this instance in your web browser at [http://localhost:4242](http://localhost:4242/)

Log in to the platform using these credentials:

```
Username: admin
Password: unleash4all
```

The unleash platform shows a list of feature flags that you’ve generated. Click on the ‘New Feature Toggle’ button to create a new feature flag.

![Create a new feature flag](/img/react-tutorial-create-new-flag.png)


### Create and enable a feature flag


In this section, you will create a feature flag on the platform and turn it on for your React app.

In the [Create Toggle view](http://localhost:4242/projects/default/create-toggle/), give your feature flag a unique name and click ‘Create toggle feature’.

For the purpose of this tutorial, you won’t need to change the default values in the rest of the feature flag form.

Your new feature flag is created and ready to be used. Enable the flag for your development environment, which makes it accessible to be used in the React app we will generate from your local environment.

![Create feature flag form](/img/react-tutorial-create-flag-form.png)


Your new feature flag is created and ready to be used. Enable the flag for your development environment, which makes it accessible to be used in the React app we will generate from your local environment.

![Enable flag for development environment](/img/react-tutorial-enable-dev-env.png)


### Generate an API token


In this section, you will generate an API token to authenticate calls made to Unleash servers to access and use the feature flag in your project. This API token will eventually be pulled into a configuration object within your React application to toggle features.

From your project view on the platform, click on [Project Settings](http://localhost:4242/projects/default/settings/environments) and then [API Access](http://localhost:4242/projects/default/settings/api-access).

Click on the ‘New API token’ button.

![Create new API token](/img/react-tutorial-create-api-token.png)

Name the API token and connect to the Client-side SDK. 

The token should have access to the “development” environment, as shown in the platform screenshot below.

![Create new projet API token](/img/react-tutorial-create-api-token-form.png)

The API token you have generated can be managed in the API Access view in your project settings. This token will come in handy in Step 5.


### Create a React app


In this section, you will generate a React app from [Vite](https://vitejs.dev/guide/), which helps developers to quickly generate React projects using only one command. The repo you will install is composed of all the components needed for a basic React app to build, run, and modify.

In your terminal window, navigate out of the unleash directory and into a directory in which you aim to keep your React repository.

Run the following command:

```
# npm 7+, extra double-dash is needed:
npm create vite@latest my-unleash-react-app -- --template react

# yarn
yarn create vite my-unleash-react-app --template react
```

Navigate to your project and run it:

```
cd my-unleash-react-app

# npm
npm install
npm run dev

# yarn
yarn
yarn dev
```

### Set up Unleash in your app


It’s time to pull in your newly created feature flag in your app. Run either of the following commands, depending on the package manager you are using, into your project:

```
# npm
npm install @unleash/proxy-client-react unleash-proxy-client

# yarn
yarn add @unleash/proxy-client-react unleash-proxy-client
```

Once unleash has been installed, open up a code editor like VSCode to view your React repo.

In `index.js`, replace the code with this code snippet:

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FlagProvider } from '@unleash/proxy-client-react';

const config = {
 url: 'http://localhost:4242/api/frontend', // Your local instance Unleash API URL
 clientKey: '<client_key>', // Your client-side API token
 refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
 appName: 'app-name', // The name of your application. It's only used for identifying your application
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
   <FlagProvider config={config}>
     <App />
   </FlagProviders>
 </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```


Now, replace the `<client_key>` string in the config object with the API token you generated. You can do this by copying the API token into your clipboard from the API Access view table and pasting it into the code. 

Name your app by replacing the `app-name` string.

This configuration object is used to populate the `FlagProvider` component that comes from Unleash and wraps around the application, using the credentials to target the specific feature flag you created for the project.

You can find more documentation on Unleash API tokens and client keys [here](https://docs.getunleash.io/reference/api-tokens-and-client-keys#front-end-tokens).

Additionally, we have documentation on using the [Client-Side SDK with React](https://docs.getunleash.io/reference/sdks/react) for advanced use cases.


### Set up components to toggle


In this section, you will create components that will render based on whether or not the feature flag is enabled. The components render an example navigation menu in which one is styled with Tailwind CSS and one is without any CSS. If the flag is enabled, the styled navigation bar will display. If it is not enabled, the unstyled navigation text will display in the browser.

This toggle experience is meant to be a much smaller, simplistic example of a CSS migration plan that a team of developers and designers could be assigned in a real setting. There is a process for switching out styling frameworks if developer teams aim to find the latest framework that suits their teams more. Feature flags can be useful for these types of projects, as pushing code doesn’t have to be so binary, even though the toggling of a flag is. It is intended to represent a safe course of action that is reversible if need be as something like a brand transition begins to take place for a company or team.

To install Tailwind into the app, follow the steps below. You can also read into Tailwind and React more by reviewing the [Tailwind CSS and React documentation](https://tailwindcss.com/docs/guides/vite).


```
# npm
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```


Add the following paths to the newly generated file `tailwind.config.js`:

```js
 content: [
   "./src/**/*.{js,jsx,ts,tsx}",
 ],
 ```


Add directives to the file `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```


Run the following command to start up the app again, this time with fast-loading updates from changes you make in the CSS.

```
# npm
npm run start

# yarn
yard dev
```

Now, adding Tailwind CSS utility classes to HTML tags in React will automatically result in some styling changes in the UI.

To create the two components that will represent the feature flag being on and off, respectively, create a file called `Menu.js` in the `/src` directory.

Use this code snippet to paste into `src/Menu.js`:

```js
import { useFlag } from '@unleash/proxy-client-react';


const TailWindCSSMenu = () => {
   const menuHoverStyle = 'md:p-4 py-2 block hover:text-purple-400';
   return (
   <div
   className="
       antialiased
       bg-gradient-to-r
       from-pink-300
       via-purple-300
       to-indigo-400
   "
 >
   <header>
   <nav
      className="
        flex flex-wrap
        items-center
        justify-between
        w-full
        py-4
        md:py-0
        px-4
        text-lg text-gray-700
        bg-white
      "
    >
     <div>
     <div className="hidden w-full md:flex md:items-center md:w-auto" id="menu">
        <ul
          className="
            pt-4
            text-base text-gray-700
            md:flex
            md:justify-between
            md:pt-0"
        >
          <li>
            <a className={menuHoverStyle} href="#">
               Features
           </a>
          </li>
          <li>
            <a className={menuHoverStyle} href="#">
               Pricing
           </a>
          </li>
          <li>
            <a className={menuHoverStyle} href="#">
               Customers
           </a>
          </li>
          <li>
            <a className={menuHoverStyle} href="#">
               Blog
           </a>
          </li>
          <li>
            <a
              className={menuHoverStyle}
              href="#">
               Sign Up
           </a>
          </li>
        </ul>
      </div>
      </div>
  </nav>
</header>
<div className="px-4">
    <div
      className="
        flex
        justify-center
        items-center
        bg-white
        mx-auto
        max-w-2xl
        rounded-lg
        my-16
        p-16
      "
    >
      <h1 className="text-2xl font-medium">Navbar with TailwindCSS</h1>
    </div>
  </div>
  </div>
  )
};

const BarebonesNav = () => {
   return (
       <div>
           <ul>
               <li>Features</li>
               <li>Pricing</li>
               <li>Customers</li>
               <li>Blog</li>
               <li>Sign Up</li>
           </ul>
       </div>
   )
}

const Menu = () => {
 const enabled = useFlag('ReactCaseFlag');

 return enabled ? <TailWindCSSMenu /> : <BarebonesNav />;

};

export default Menu;

```


In this file, there is:
- a styled menu component `TailWindCSSMenu`
- an unstyled menu component `BarebonesNav`
- a reference pointing to the feature flag `ReactCaseFlag`
- a conditional rendering of the menus based upon the feature toggle

Loading localhost:3000/ should show this view after the code above has been added to the repo:

![UI with Tailwind CSS](/img/react-tutorial-tailwind-css.png)

If your UI resembles this, your code has correctly targeted the feature flag!


### Verify the toggle experience


In the Unleash instance, you can toggle your feature flag on or off to verify that the different UI experiences load accordingly. 

Disabling the flag in the development environment results in a view of a navigation menu without any particular styling.

### Conclusion

In this tutorial, you learned how to install Unleash onto your machine, create a new feature flag, install Unleash into a new React project, and toggle a feature flag to show CSS differences in the UI between two components.

