/// <reference types="cypress" />

type UserCredentials = { email: string; password: string };
const ENTERPRISE = Boolean(Cypress.env('ENTERPRISE'));
const randomId = String(Math.random()).split('.')[1];
const featureToggleName = `notifications_test-${randomId}`;
const baseUrl = Cypress.config().baseUrl;
let strategyId = '';
const userIds: number[] = [];
const userCredentials: UserCredentials[] = [];
const userName = `notifications_user-${randomId}`;
const projectName = `default`;
const password = Cypress.env(`AUTH_PASSWORD`) + '_A';
const EDITOR = 2;
const PROJECT_MEMBER = 5;

// Disable all active splash pages by visiting them.
const disableActiveSplashScreens = () => {
    cy.visit(`/splash/operators`);
};

const createUser = () => {
    const name = `${userName}`;
    const email = `${name}@test.com`;
    cy.request('POST', `${baseUrl}/api/admin/user-admin`, {
        name: name,
        email: `${name}@test.com`,
        username: `${name}@test.com`,
        sendEmail: false,
        rootRole: EDITOR,
    })
        .as(name)
        .then(response => {
            const id = response.body.id;
            updateUserPassword(id).then(() => {
                addUserToProject(id).then(() => {
                    userIds.push(id);
                    userCredentials.push({ email, password });
                });
            });
        });
};

const updateUserPassword = async (id: number) => {
    cy.request(
        'POST',
        `${baseUrl}/api/admin/user-admin/${id}/change-password`,
        {
            password,
        }
    );
};

const addUserToProject = async (id: number) => {
    cy.request(
        'POST',
        `${baseUrl}/api/admin/projects/${projectName}/role/${PROJECT_MEMBER}/access`,
        {
            groups: [],
            users: [{ id }],
        }
    );
};

describe('notifications', () => {
    before(() => {
        disableActiveSplashScreens();
        cy.login();
        createUser();
    });

    after(() => {
        // We need to login as admin for cleanup
        cy.login();
        userIds.forEach(id =>
            cy.request('DELETE', `${baseUrl}/api/admin/user-admin/${id}`)
        );

        cy.request(
            'DELETE',
            `${baseUrl}/api/admin/features/${featureToggleName}`
        );
    });

    beforeEach(() => {
        cy.login();
        cy.visit(`/projects/${projectName}`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    afterEach(() => {
        cy.logout();
    });

    const createFeature = () => {
        cy.get('[data-testid=NAVIGATE_TO_CREATE_FEATURE').click();

        cy.intercept('POST', `/api/admin/projects/${projectName}/features`).as(
            'createFeature'
        );

        cy.get("[data-testid='CF_NAME_ID'").type(featureToggleName);
        cy.get("[data-testid='CF_DESC_ID'").type('hello-world');
        cy.get("[data-testid='CF_CREATE_BTN_ID']").click();
        cy.wait('@createFeature');
    };

    it('should create a notification when a feature is created in a project', () => {
        createFeature();

        //Should not show own notifications
        cy.get("[data-testid='NOTIFICATIONS_BUTTON']").click();

        //then
        cy.get("[data-testid='NOTIFICATIONS_MODAL']").should('exist');

        const credentials = userCredentials[0];

        //Sign in as a different user
        cy.login(credentials.email, credentials.password);
        cy.visit(`/projects/${projectName}`);
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
        cy.get("[data-testid='NOTIFICATIONS_BUTTON']").click();

        //then
        cy.get("[data-testid='UNREAD_NOTIFICATIONS']").should('exist');
        cy.get("[data-testid='NOTIFICATIONS_LIST']")
            .should('have.length', 1)
            .eq(0)
            .should('contain.text', 'New feature');
    });
});
