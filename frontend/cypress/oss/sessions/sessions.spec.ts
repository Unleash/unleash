///<reference path="../../global.d.ts" />

const baseUrl = Cypress.config().baseUrl;

const enableSessionInspectorFlag = () => {
    cy.intercept('GET', `${baseUrl}/api/admin/ui-config`, (req) => {
        req.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
        req.on('response', (res) => {
            if (res.body) {
                res.body.flags = {
                    ...res.body.flags,
                    sessionInspector: true,
                };
            }
        });
    });
};

describe('Session inspector', () => {
    before(() => {
        cy.runBefore();
    });

    beforeEach(() => {
        enableSessionInspectorFlag();
        cy.login_UI();
    });

    it('shows the session inspector in the admin sidebar', () => {
        cy.visit('/admin');
        cy.contains('Session inspector').should('exist');
    });

    it('navigates to the session inspector page', () => {
        cy.visit('/admin/sessions');
        cy.contains('Session inspector').should('exist');
    });

    it('displays the current session in the table', () => {
        cy.visit('/admin/sessions');
        // After logging in there should be at least one session row
        cy.get('table, [role="table"], [role="grid"]')
            .should('exist')
            .within(() => {
                cy.contains('admin').should('exist');
            });
    });

    it('shows session columns: User, Browser, IP address, Session started, Duration, Expires', () => {
        cy.visit('/admin/sessions');
        const expectedHeaders = [
            'User',
            'Browser',
            'IP address',
            'Session started',
            'Duration',
            'Expires',
        ];
        for (const header of expectedHeaders) {
            cy.contains(header).should('exist');
        }
    });

    it('can search sessions by username', () => {
        cy.visit('/admin/sessions');

        cy.get('input[placeholder*="Search"]').type('admin');
        cy.contains('admin').should('exist');

        cy.get('input[placeholder*="Search"]').clear().type('zzz-nonexistent');
        cy.contains('No sessions match your search').should('exist');
    });

    it('opens revoke confirmation dialog when Revoke button is clicked', () => {
        cy.visit('/admin/sessions');

        cy.contains('button', 'Revoke').first().click();
        cy.contains('Revoke session').should('exist');
        cy.contains('They will be logged out immediately').should('exist');
    });

    it('closes revoke dialog on Cancel', () => {
        cy.visit('/admin/sessions');

        cy.contains('button', 'Revoke').first().click();
        cy.contains('Revoke session').should('exist');

        cy.contains('button', 'Cancel').click();
        cy.contains('Revoke session').should('not.exist');
    });
});

describe('Session inspector API', () => {
    before(() => {
        cy.runBefore();
    });

    beforeEach(() => {
        cy.login_UI();
    });

    it('GET /api/admin/sessions returns a sessions array', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/api/admin/sessions`,
        }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.have.property('sessions');
            expect(res.body.sessions).to.be.an('array');
        });
    });

    it('sessions have the expected shape', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/api/admin/sessions`,
        }).then((res) => {
            expect(res.body.sessions.length).to.be.greaterThan(0);
            const session = res.body.sessions[0];
            expect(session).to.have.property('id');
            expect(session).to.have.property('userId');
            expect(session).to.have.property('createdAt');
            // id should be an opaque identifier, not a raw session token
            expect(session).not.to.have.property('sid');
        });
    });

    it('DELETE /api/admin/sessions/:id revokes a session', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/api/admin/sessions`,
        }).then((listRes) => {
            const sessions = listRes.body.sessions;
            // Need at least 2 sessions to safely revoke one without logging out
            if (sessions.length < 2) {
                cy.log(
                    'Skipping revoke test: not enough sessions to safely test',
                );
                return;
            }

            // Revoke the oldest session (last in list since sorted newest-first)
            const toRevoke = sessions[sessions.length - 1];
            cy.request({
                method: 'DELETE',
                url: `${baseUrl}/api/admin/sessions/${toRevoke.id}`,
            }).then((deleteRes) => {
                expect(deleteRes.status).to.eq(200);
            });

            // Verify it is gone
            cy.request({
                method: 'GET',
                url: `${baseUrl}/api/admin/sessions`,
            }).then((afterRes) => {
                const ids = afterRes.body.sessions.map((s: any) => s.id);
                expect(ids).not.to.include(toRevoke.id);
            });
        });
    });
});
