[![Build Status](https://travis-ci.org/Unleash/unleash-frontend.svg?branch=main)](https://travis-ci.org/Unleash/unleash-frontend)

# Developing

### Why did you render

This application is set up with [WDYR](https://github.com/welldone-software/why-did-you-render) and [craco](https://github.com/gsoft-inc/craco) in order to find, debug and remove uneccesary re-renders. This configuration can be found in /src/wdyr.ts.

In order to turn it on, change the configuration accordingly:

```
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
```

Now you should be able to review rendering information in the console. If you do utilise this functionality, please remember to set the configuration back to spare other developers the noise in the console.

### Run with together with local unleash-api:

You need to first start the unleash-api on port 4242
before you can start working on unleash-frontend.
Start webpack-dev-server with hot-reload:

```bash
cd ~/unleash-frontend
yarn install
yarn run start
```

### Run with heroku hosted unleash-api:

```bash
cd ~/unleash-frontend
yarn install
yarn run start:heroku
```

## UI Framework

We are using [material-ui](http://material-ui.com/).

Happy coding!
