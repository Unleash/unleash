import type { APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4242';

export async function deleteFeatureAPI(
    request: APIRequestContext,
    name: string,
    projectName = 'default',
): Promise<void> {
    await request.delete(
        `${BASE_URL}/api/admin/projects/${projectName}/features/${name}`,
    );
    await request.delete(`${BASE_URL}/api/admin/archive/${name}`);
}

export async function createProjectAPI(
    request: APIRequestContext,
    projectName: string,
): Promise<void> {
    await request.post(`${BASE_URL}/api/admin/projects`, {
        data: {
            id: projectName,
            name: projectName,
            description: projectName,
            impressionData: false,
        },
    });
}

export async function deleteProjectAPI(
    request: APIRequestContext,
    projectName: string,
): Promise<void> {
    await request.delete(`${BASE_URL}/api/admin/projects/${projectName}`);
}

export async function createFeatureAPI(
    request: APIRequestContext,
    featureName: string,
    projectName = 'default',
): Promise<void> {
    await request.post(
        `${BASE_URL}/api/admin/projects/${projectName}/features`,
        {
            data: {
                name: featureName,
                description: 'hello-world',
                type: 'release',
                impressionData: false,
            },
        },
    );
}

export async function createUserAPI(
    request: APIRequestContext,
    name: string,
    email: string,
    rootRole = 3,
): Promise<number> {
    const response = await request.post(`${BASE_URL}/api/admin/user-admin`, {
        data: { name, email, sendEmail: false, rootRole },
    });
    const body = await response.json();
    return body.id;
}

export async function deleteUserAPI(
    request: APIRequestContext,
    id: number,
): Promise<void> {
    await request.delete(`${BASE_URL}/api/admin/user-admin/${id}`);
}

export async function createGroupAPI(
    request: APIRequestContext,
    name: string,
    userIds: number[] = [],
): Promise<number> {
    const response = await request.post(`${BASE_URL}/api/admin/groups`, {
        data: {
            name,
            users: userIds.map((id) => ({ user: { id } })),
        },
    });
    const body = await response.json();
    return body.id;
}

export async function deleteGroupAPI(
    request: APIRequestContext,
    id: number,
): Promise<void> {
    await request.delete(`${BASE_URL}/api/admin/groups/${id}`);
}
