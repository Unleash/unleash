///<reference path="../global.d.ts" />

import {
    runBefore,
    loginUI,
    logoutUI,
    createProjectUI,
    createFeatureUI,
    createSegmentUI,
    deleteSegmentUI,
    deleteFeatureStrategyUI,
    addFlexibleRolloutStrategyToFeatureUI,
    updateFlexibleRolloutStrategyUI,
    doLogin,
    disableActiveSplashScreens,
} from './UI.ts';
import {
    addUserToProjectAPI,
    createFeatureAPI,
    createProjectAPI,
    createUserAPI,
    deleteFeatureAPI,
    deleteProjectAPI,
    updateUserPasswordAPI,
    createEnvironmentAPI,
} from './API.ts';

Cypress.on('window:before:load', (window) => {
    Object.defineProperty(window.navigator, 'language', { value: 'en' });
    Object.defineProperty(window.navigator, 'languages', { value: ['en'] });
});
Cypress.Commands.add('runBefore', runBefore);
Cypress.Commands.add('disableActiveSplashScreens', disableActiveSplashScreens);
Cypress.Commands.add('loginUI', loginUI);
Cypress.Commands.add('doLogin', doLogin);
Cypress.Commands.add('createSegmentUI', createSegmentUI);
Cypress.Commands.add('deleteSegmentUI', deleteSegmentUI);
Cypress.Commands.add('deleteFeatureAPI', deleteFeatureAPI);
Cypress.Commands.add('deleteProjectAPI', deleteProjectAPI);
Cypress.Commands.add('logoutUI', logoutUI);
Cypress.Commands.add('createProjectUI', createProjectUI);
Cypress.Commands.add('createProjectAPI', createProjectAPI);
Cypress.Commands.add('createUserAPI', createUserAPI);
Cypress.Commands.add('addUserToProjectAPI', addUserToProjectAPI);
Cypress.Commands.add('updateUserPasswordAPI', updateUserPasswordAPI);
Cypress.Commands.add('createFeatureUI', createFeatureUI);
Cypress.Commands.add('deleteFeatureStrategyUI', deleteFeatureStrategyUI);
Cypress.Commands.add('createFeatureAPI', createFeatureAPI);
Cypress.Commands.add(
    'addFlexibleRolloutStrategyToFeatureUI',
    addFlexibleRolloutStrategyToFeatureUI,
);
Cypress.Commands.add(
    'updateFlexibleRolloutStrategyUI',
    updateFlexibleRolloutStrategyUI,
);
Cypress.Commands.add('createEnvironmentAPI', createEnvironmentAPI);
Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) => {
    if (!options.headers) {
        options.headers = {};
    }

    // Add the x-vercel-skip-toolbar header. See: https://vercel.com/docs/workflow-collaboration/vercel-toolbar/managing-toolbar#disable-toolbar-for-automation
    options.headers['x-vercel-skip-toolbar'] = '1';

    return originalFn(url, options);
});

Cypress.Commands.overwrite('click', (originalFn, x, y, options = {}) => {
    options.waitForAnimations = false;
    return originalFn(x, y, options);
});
