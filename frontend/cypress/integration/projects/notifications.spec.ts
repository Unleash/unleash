/// <reference types="cypress" />

const ENTERPRISE = Boolean(Cypress.env('ENTERPRISE'));
const randomId = String(Math.random()).split('.')[1];
const featureToggleName = `unleash-e2e-${randomId}`;
const baseUrl = Cypress.config().baseUrl;
let strategyId = '';
const userIds: any[] = [];
const userName = `user-e2e-${randomId}`;
const projectName = `project-e2e-${randomId}`;

// Disable the prod guard modal by marking it as seen.
const disableFeatureStrategiesProdGuard = () => {
    localStorage.setItem(
        'useFeatureStrategyProdGuardSettings:v2',
        JSON.stringify({ hide: true })
    );
};

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

const createUsers = () => {
    for (let i = 1; i <= 2; i++) {
        const name = `${i}-${userName}`;
        cy.request('POST', `${baseUrl}/api/admin/user-admin`, {
            name: name,
            email: `${name}@test.com`,
            sendEmail: false,
            rootRole: i + 1,
        })
            .as(name)
            .then(response => {
                const id = response.body.id;
                userIds.push(id);
            });
    }
};

const addMembersToProject = () => {
    cy.request(
        'POST',
        `${baseUrl}/api/admin/projects/${projectName}/role/5/access`,
        {
            groups: [],
            users: userIds.map(id => {
                return {
                    id,
                };
            }),
        }
    );
};

const createProject = () => {
    cy.request('POST', `${baseUrl}/api/admin/projects`, {
        id: projectName,
        name: projectName,
    });
};

describe('notifications', () => {
    before(() => {
        disableActiveSplashScreens();
        disableFeatureStrategiesProdGuard();
        cy.login();
        createUsers();
        createProject();
        addMembersToProject();
    });

    after(() => {
        userIds.forEach(id =>
            cy.request('DELETE', `${baseUrl}/api/admin/user-admin/${id}`)
        );

        cy.request('DELETE', `${baseUrl}/api/admin/projects/${projectName}`);
    });

    beforeEach(() => {
        cy.login();
        cy.visit(`/projects/${projectName}`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    const createFeature = () => {
        cy.get('[data-testid=NAVIGATE_TO_CREATE_FEATURE').click();

        cy.intercept('POST', '/api/admin/projects/default/features').as(
            'createFeature'
        );

        cy.get("[data-testid='CF_NAME_ID'").type(featureToggleName);
        cy.get("[data-testid='CF_DESC_ID'").type('hello-world');
        cy.get("[data-testid='CF_CREATE_BTN_ID']").click();
        cy.wait('@createFeature');
    };

    it('should create a notification when a feature is created in a project', () => {
        //given
        createFeature();
        //when
        cy.log;

        //then
    });
});
