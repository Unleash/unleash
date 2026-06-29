/// <reference types="cypress" />

// The recorder URL must be same-origin: the backend's CSP connect-src is built
// from the real flag, not our intercepted ui-config, and only allows 'self'.
const RECORDER_PATH = '/e2e-recorder-sink';

type RecordedEvent = {
    eventType: string;
    eventName: string;
    payload: {
        path: string;
        params: Record<string, string>;
        pageviewId: string;
    };
};

describe('page view tracking', () => {
    before(() => {
        cy.runBefore();
    });

    beforeEach(() => {
        // Turn the flag on and point the recorder at our same-origin sink. Only
        // the flags are touched so unleashContext stays — the first pageview is
        // gated on identity having loaded.
        cy.intercept('GET', '**/api/admin/ui-config', (req) => {
            req.on('response', (res) => {
                res.body.flags = {
                    ...res.body.flags,
                    flightRecorderFrontend: {
                        name: 'flightRecorderFrontend',
                        enabled: true,
                        payload: { type: 'string', value: RECORDER_PATH },
                    },
                };
            });
        });
        cy.intercept('POST', `**${RECORDER_PATH}`, { statusCode: 200 }).as(
            'recorder',
        );
        cy.loginUI();
    });

    it('records the visited route as a templated, low-cardinality pageview', () => {
        cy.visit('/projects/default/settings');
        cy.get("[data-testid='HEADER_USER_AVATAR']").should('be.visible');

        // flushAt is 100 and the timer is 10s, so nothing posts on its own;
        // pagehide forces an immediate flush of the buffered pageview.
        cy.window().then((win) => win.dispatchEvent(new Event('pagehide')));

        cy.wait('@recorder')
            .its('request.body')
            .then((body) =>
                cy.task<RecordedEvent[]>('decodeRecorderBody', body),
            )
            .then((events) => {
                const pageviews = events.filter(
                    (event) => event.eventName === 'pageview',
                );

                // Exactly one: the '/' redirect resolves to no route and is
                // skipped, so only the visited page is recorded. (Holds on the
                // prod build; the dev server's StrictMode would double-fire.)
                expect(
                    pageviews,
                    'exactly one pageview recorded',
                ).to.have.length(1);
                // The concrete project id stays out of the path (cardinality)
                // and lives in params instead.
                expect(pageviews[0].payload.path).to.equal(
                    '/projects/:projectId/settings',
                );
                expect(pageviews[0].payload.params).to.deep.equal({
                    projectId: 'default',
                });
                expect(pageviews[0].payload.pageviewId).to.be.a('string').and
                    .not.be.empty;
            });
    });
});
