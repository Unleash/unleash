///<reference path="../../global.d.ts" />

describe('imports', () => {
    const baseUrl = Cypress.config().baseUrl;
    const randomSeed = String(Math.random()).split('.')[1];
    const randomFeatureName = `cypress-features${randomSeed}`;
    const userIds: any[] = [];

    before(() => {
        cy.runBefore();
        cy.login_UI();
        for (let i = 1; i <= 2; i++) {
            cy.request('POST', `${baseUrl}/api/admin/user-admin`, {
                name: `unleash-e2e-user${i}-${randomFeatureName}`,
                email: `unleash-e2e-user${i}-${randomFeatureName}@test.com`,
                sendEmail: false,
                rootRole: 3,
            }).then(response => userIds.push(response.body.id));
        }
    });

    after(() => {
        userIds.forEach(id =>
            cy.request('DELETE', `${baseUrl}/api/admin/user-admin/${id}`)
        );
    });

    beforeEach(() => {
        cy.login_UI();
        if (document.querySelector("[data-testid='CLOSE_SPLASH']")) {
            cy.get("[data-testid='CLOSE_SPLASH']").click();
        }
    });

    it('can import data', () => {
        cy.visit('/projects/default');
        cy.get("[data-testid='IMPORT_BUTTON']").click({ force: true });

        const exportText = {
            features: [
                {
                    name: randomFeatureName,
                    description: '',
                    type: 'release',
                    project: 'default',
                    stale: false,
                    impressionData: false,
                    archived: false,
                },
            ],
            featureStrategies: [
                {
                    name: 'flexibleRollout',
                    id: '14a0d9dd-2b5d-4a21-98fd-ede72bda0328',
                    featureName: randomFeatureName,
                    parameters: {
                        groupId: randomFeatureName,
                        rollout: '50',
                        stickiness: 'default',
                    },
                    constraints: [],
                    segments: [],
                },
            ],
            featureEnvironments: [
                {
                    enabled: true,
                    featureName: randomFeatureName,
                    environment: 'test',
                    variants: [],
                    name: randomFeatureName,
                },
            ],
            contextFields: [],
            featureTags: [
                {
                    featureName: randomFeatureName,
                    tagType: 'simple',
                    tagValue: 'best-tag',
                },
                {
                    featureName: randomFeatureName,
                    tagType: 'simple',
                    tagValue: 'rserw',
                },
                {
                    featureName: randomFeatureName,
                    tagType: 'simple',
                    tagValue: 'FARO',
                },
            ],
            segments: [],
            tagTypes: [
                {
                    name: 'simple',
                    description: 'Used to simplify filtering of features',
                    icon: '#',
                },
            ],
        };

        cy.get("[data-testid='VALIDATE_BUTTON']").should('be.disabled');

        // cypress can only work with input@file that is visible
        cy.get('input[type=file]')
            .invoke('attr', 'style', 'display: block')
            .selectFile({
                contents: Cypress.Buffer.from(JSON.stringify(exportText)),
                fileName: 'upload.json',
                lastModified: Date.now(),
            });
        cy.get("[data-testid='VALIDATE_BUTTON']").click();
        cy.get("[data-testid='IMPORT_CONFIGURATION_BUTTON']").click();
        // cy.contains('Import completed');

        cy.visit(`/projects/default/features/${randomFeatureName}`);

        cy.wait(500);

        cy.get(
            "[data-testid='feature-toggle-status'] input[type='checkbox']:checked"
        )
            .invoke('attr', 'aria-label')
            .should('eq', 'development');
        cy.contains('50%');
    });
});
