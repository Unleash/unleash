///<reference path="../global.d.ts" />

import Chainable = Cypress.Chainable;
const baseUrl = Cypress.config().baseUrl;
const password = Cypress.env(`AUTH_PASSWORD`) + '_A';
const PROJECT_MEMBER = 5;
export const createFeature_API = (
    featureName: string,
    projectName?: string,
    options?: Partial<Cypress.RequestOptions>
): Chainable<any> => {
    const project = projectName || 'default';
    return cy.request({
        url: `${baseUrl}/api/admin/projects/${project}/features`,
        method: 'POST',
        body: {
            name: `${featureName}`,
            description: 'hello-world',
            type: 'release',
            impressionData: false,
        },
        ...options,
    });
};

export const deleteFeature_API = (name: string): Chainable<any> => {
    cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/admin/projects/default/features/${name}`,
    });
    return cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/admin/archive/${name}`,
    });
};

export const createProject_API = (
    project: string,
    options?: Partial<Cypress.RequestOptions>
): Chainable<any> => {
    return cy.request({
        url: `${baseUrl}/api/admin/projects`,
        method: 'POST',
        body: {
            id: project,
            name: project,
            description: project,
            impressionData: false,
        },
        ...options,
    });
};

export const deleteProject_API = (name: string): Chainable<any> => {
    return cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/admin/projects/${name}`,
    });
};

export const createUser_API = (userName: string, role: number) => {
    const name = `${userName}`;
    const email = `${name}@test.com`;
    const userIds: number[] = [];
    const userCredentials: Cypress.UserCredentials[] = [];
    cy.request('POST', `${baseUrl}/api/admin/user-admin`, {
        name: name,
        email: `${name}@test.com`,
        username: `${name}@test.com`,
        sendEmail: false,
        rootRole: role,
    })
        .as(name)
        .then(response => {
            const id = response.body.id;
            updateUserPassword_API(id).then(() => {
                addUserToProject_API(id, PROJECT_MEMBER).then(value => {
                    userIds.push(id);
                    userCredentials.push({ email, password });
                });
            });
        });
    return cy.wrap({ userIds, userCredentials });
};

export const updateUserPassword_API = (id: number, pass?: string): Chainable =>
    cy.request(
        'POST',
        `${baseUrl}/api/admin/user-admin/${id}/change-password`,
        {
            password: pass || password,
        }
    );

export const addUserToProject_API = (
    id: number,
    role: number,
    projectName?: string
): Chainable => {
    const project = projectName || 'default';
    return cy.request(
        'POST',
        `${baseUrl}/api/admin/projects/${project}/role/${role}/access`,
        {
            groups: [],
            users: [{ id }],
        }
    );
};

interface IEnvironment {
    name: string;
    type: 'development' | 'preproduction' | 'test' | 'production';
}

export const createEnvironment_API = (
    environment: IEnvironment,
    options?: Partial<Cypress.RequestOptions>
): Chainable<any> => {
    return cy.request({
        url: `${baseUrl}/api/admin/environments`,
        method: 'POST',
        body: environment,
        ...options,
    });
};
