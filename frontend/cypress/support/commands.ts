///<reference path="../global.d.ts" />

import {
    runBefore,
    login_UI,
    logout_UI,
    createProject_UI,
    createFeature_UI,
    createSegment_UI,
    deleteSegment_UI,
    deleteVariant_UI,
    deleteFeatureStrategy_UI,
    addFlexibleRolloutStrategyToFeature_UI,
    addUserIdStrategyToFeature_UI,
    updateFlexibleRolloutStrategy_UI,
    addVariantsToFeature_UI,
    //@ts-ignore
} from './UI';
import {
    addUserToProject_API,
    createFeature_API,
    createProject_API,
    createUser_API,
    deleteFeature_API,
    deleteProject_API,
    updateUserPassword_API,
    createEnvironment_API,
    //@ts-ignore
} from './API';

Cypress.Commands.add('runBefore', runBefore);
Cypress.Commands.add('login_UI', login_UI);
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
Cypress.Commands.add('deleteVariant_UI', deleteVariant_UI);
Cypress.Commands.add('addVariantsToFeature_UI', addVariantsToFeature_UI);
Cypress.Commands.add(
    'addUserIdStrategyToFeature_UI',
    addUserIdStrategyToFeature_UI
);
Cypress.Commands.add(
    'addFlexibleRolloutStrategyToFeature_UI',
    addFlexibleRolloutStrategyToFeature_UI
);
Cypress.Commands.add(
    'updateFlexibleRolloutStrategy_UI',
    updateFlexibleRolloutStrategy_UI
);
Cypress.Commands.add('createEnvironment_API', createEnvironment_API);
