///<reference path="../../global.d.ts" />

const EDITOR = 2;

describe('notifications', () => {
    const randomId = String(Math.random()).split('.')[1];
    const featureToggleName = `notifications_test-${randomId}`;
    const baseUrl = Cypress.config().baseUrl;
    let userIds: number[] = [];
    let userCredentials: Cypress.UserCredentials[] = [];
    const userName = `notifications_user-${randomId}`;
    const projectName = `default`;

    before(() => {
        cy.runBefore();
    });

    it('should create a notification when a feature is created in a project', () => {
        cy.login_UI();
        cy.createUser_API(userName, EDITOR).then(value => {
            userIds = value.userIds;
            userCredentials = value.userCredentials;

            cy.login_UI();
            cy.visit(`/projects/${projectName}`);

            cy.createFeature_UI(featureToggleName);

            //Should not show own notifications
            cy.get("[data-testid='NOTIFICATIONS_BUTTON']").click();

            //then
            cy.get("[data-testid='NOTIFICATIONS_MODAL']").should('exist');

            const credentials = userCredentials[0];

            //Sign in as a different user
            cy.login_UI(credentials.email, credentials.password);
            cy.visit(`/projects/${projectName}`);
            cy.get("[data-testid='NOTIFICATIONS_BUTTON']").click();

            //then
            cy.get("[data-testid='UNREAD_NOTIFICATIONS']").should('exist');
            cy.get("[data-testid='NOTIFICATIONS_LIST']").should(
                'contain.text',
                `New feature ${featureToggleName}`
            );

            //clean
            // We need to login as admin for cleanup
            cy.login_UI();
            userIds.forEach(id =>
                cy.request('DELETE', `${baseUrl}/api/admin/user-admin/${id}`)
            );

            cy.deleteFeature_API(featureToggleName);
        });
    });
});
