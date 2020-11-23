[![Build Status](https://travis-ci.org/Unleash/unleash-frontend.svg?branch=master)](https://travis-ci.org/Unleash/unleash-frontend)

# Developing

### Run with together with local unleash-api:

You need to first start the unleash-api on port 4242 
before you can start working on unleash-frontend.  

Start webpack-dev-server with hot-reload:
```bash
cd ~/unleash-frontend
npm install
npm run start 
```

### Run with heroku hosted unleash-api:

```bash
cd ~/unleash-frontend
npm install
npm run start:heroku
```

## UI Framework
Currently using [react-mdl](https://tleunen.github.io/react-mdl/components/) which is a deprecated and closed project.

Happy coding!
