///<reference path="../global.d.ts" />

import Chainable = Cypress.Chainable;
const baseUrl = Cypress.config().baseUrl;
const password = `${Cypress.env(`AUTH_PASSWORD`)}_A`;
const PROJECT_MEMBER = 5;

export const createFeatureAPI = (
    featureName: string,
    projectName?: string,
    options?: Partial<Cypress.RequestOptions>,
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

export const deleteFeatureAPI = (
    name: string,
    projectName?: string,
): Chainable<any> => {
    const project = projectName || 'default';
    cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/admin/projects/${project}/features/${name}`,
    });
    return cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/admin/archive/${name}`,
    });
};

export const createProjectAPI = (
    project: string,
    options?: Partial<Cypress.RequestOptions>,
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

export const deleteProjectAPI = (name: string): Chainable<any> => {
    return cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/admin/projects/${name}`,
    });
};

export const createUserAPI = (userName: string, role: number) => {
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
        .then((response) => {
            const id = response.body.id;
            updateUserPasswordAPI(id).then(() => {
                addUserToProjectAPI(id, PROJECT_MEMBER).then((_value) => {
                    userIds.push(id);
                    userCredentials.push({ email, password });
                });
            });
        });
    return cy.wrap({ userIds, userCredentials });
};

export const updateUserPasswordAPI = (id: number, pass?: string): Chainable =>
    cy.request(
        'POST',
        `${baseUrl}/api/admin/user-admin/${id}/change-password`,
        {
            password: pass || password,
        },
    );

export const addUserToProjectAPI = (
    id: number,
    role: number,
    projectName?: string,
): Chainable => {
    const project = projectName || 'default';
    return cy.request(
        'POST',
        `${baseUrl}/api/admin/projects/${project}/access`,
        {
            roles: [role],
            users: [id],
        },
    );
};

interface IEnvironment {
    name: string;
    type: 'development' | 'preproduction' | 'test' | 'production';
}

export const createEnvironmentAPI = (
    environment: IEnvironment,
    options?: Partial<Cypress.RequestOptions>,
): Chainable<any> => {
    return cy.request({
        url: `${baseUrl}/api/admin/environments`,
        method: 'POST',
        body: environment,
        ...options,
    });
};
