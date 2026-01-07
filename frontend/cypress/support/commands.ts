///<reference path="../global.d.ts" />

import {
    runBefore,
    login_UI,
    logout_UI,
    createProject_UI,
    createFeature_UI,
    createSegment_UI,
    deleteSegment_UI,
    deleteFeatureStrategy_UI,
    addFlexibleRolloutStrategyToFeature_UI,
    updateFlexibleRolloutStrategy_UI,
    do_login,
} from './UI.ts';
import {
    addUserToProject_API,
    createFeature_API,
    createProject_API,
    createUser_API,
    deleteFeature_API,
    deleteProject_API,
    updateUserPassword_API,
    createEnvironment_API,
} from './API.ts';

Cypress.on('window:before:load', (window) => {
    Object.defineProperty(window.navigator, 'language', { value: 'en' });
    Object.defineProperty(window.navigator, 'languages', { value: ['en'] });
});
Cypress.Commands.add('runBefore', runBefore);
Cypress.Commands.add('login_UI', login_UI);
Cypress.Commands.add('do_login', do_login);
Cypress.Commands.add('createSegment_UI', createSegment_UI);
Cypress.Commands.add('deleteSegment_UI', deleteSegment_UI);
Cypress.Commands.add('deleteFeature_API', deleteFeature_API);
Cypress.Commands.add('deleteProject_API', deleteProject_API);
Cypress.Commands.add('logout_UI', logout_UI);
Cypress.Commands.add('createProject_UI', createProject_UI);
Cypress.Commands.add('createProject_API', createProject_API);
Cypress.Commands.add('createUser_API', createUser_API);
Cypress.Commands.add('addUserToProject_API', addUserToProject_API);
Cypress.Commands.add('updateUserPassword_API', updateUserPassword_API);
Cypress.Commands.add('createFeature_UI', createFeature_UI);
Cypress.Commands.add('deleteFeatureStrategy_UI', deleteFeatureStrategy_UI);
Cypress.Commands.add('createFeature_API', createFeature_API);
Cypress.Commands.add(
    'addFlexibleRolloutStrategyToFeature_UI',
    addFlexibleRolloutStrategyToFeature_UI,
);
Cypress.Commands.add(
    'updateFlexibleRolloutStrategy_UI',
    updateFlexibleRolloutStrategy_UI,
);
Cypress.Commands.add('createEnvironment_API', createEnvironment_API);
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
