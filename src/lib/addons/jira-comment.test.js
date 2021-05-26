const fetchMock = require('fetch-mock').sandbox();
const lolex = require('lolex');
const noLogger = require('../../test/fixtures/no-logger');

jest.mock('node-fetch', () => fetchMock);

const addonMocked = require('./addon');
jest.mock('./addon', () => addonMocked);
const JiraAddon = require('./jira-comment');
const { addonDefinitionSchema } = require('./addon-schema');

beforeEach(() => {
    fetchMock.restore();
    fetchMock.reset();
});

test('Addon definition should validate', () => {
    const { error } = addonDefinitionSchema.validate(JiraAddon.definition);
    expect(error).toBe(undefined);
});

test(
    'An update event should post updated comment with updater and link back to issue',
    async () => {
        const jiraIssue = 'TEST-1';
        const jiraBaseUrl = 'https://test.jira.com';
        const addon = new JiraAddon({
            getLogger: noLogger,
            unleashUrl: 'https://test.unleash.com',
        });
        fetchMock.mock(
            { url: `${jiraBaseUrl}/rest/api/3/issue/${jiraIssue}/comment` },
            201,
        );
        await addon.handleEvent(
            {
                createdBy: 'test@test.com',
                type: 'feature-updated',
                data: {
                    name: 'feature.toggle',
                },
                tags: [{ type: 'jira', value: jiraIssue }],
            },
            {
                baseUrl: jiraBaseUrl,
                user: 'test@test.com',
                apiKey: 'test',
            },
        );
        expect(fetchMock.calls(true).length).toBe(1);
        expect(fetchMock.done()).toBe(true);
    }
);

test('An event that is tagged with two tags causes two updates', async () => {
    const jiraBaseUrl = 'https://test.jira.com';
    const addon = new JiraAddon({
        getLogger: noLogger,
        unleashUrl: 'https://test.unleash.com',
    });
    fetchMock.mock(
        {
            name: 'test-1',
            url: `${jiraBaseUrl}/rest/api/3/issue/TEST-1/comment`,
        },
        {
            status: 201,
            statusText: 'Accepted',
        },
    );
    fetchMock.mock(
        {
            name: 'test-2',
            url: `${jiraBaseUrl}/rest/api/3/issue/TEST-2/comment`,
        },
        {
            status: 201,
            statusText: 'Accepted',
        },
    );
    await addon.handleEvent(
        {
            createdBy: 'test@test.com',
            type: 'feature-updated',
            data: {
                name: 'feature.toggle',
            },
            tags: [
                { type: 'jira', value: 'TEST-1' },
                { type: 'jira', value: 'TEST-2' },
            ],
        },
        {
            baseUrl: 'https://test.jira.com',
            user: 'test@test.com',
            apiKey: 'test',
        },
    );
    expect(fetchMock.done()).toBe(true);
});

test('An event with no jira tags will be ignored', async () => {
    const addon = new JiraAddon({
        getLogger: noLogger,
        unleashUrl: 'https://test.unleash.com',
    });
    fetchMock.any(200);
    await addon.handleEvent(
        {
            createdBy: 'test@test.com',
            type: 'feature-updated',
            data: {
                name: 'feature.toggle',
            },
            tags: [],
        },
        {
            baseUrl: 'https://test.jira.com',
            user: 'test@test.com',
            apiKey: 'test',
        },
    );
    expect(fetchMock.calls().length).toBe(0); // No calls
});

test('Retries if error code in the 500s', async () => {
    const jiraBaseUrl = 'https://test.jira.com';
    const jiraIssue = 'TEST-1';
    const clock = lolex.install();
    const addon = new JiraAddon({
        getLogger: noLogger,
        unleashUrl: 'https://test.unleash.com',
    });
    fetchMock
        .once(
            {
                name: 'rejection',
                type: 'POST',
                url: 'begin:https://test.jira.com',
            },
            500,
        )
        .mock(
            {
                name: 'acceptance',
                type: 'POST',
                url: 'begin:https://test.jira.com',
            },
            201,
        );
    await addon.handleEvent(
        {
            type: 'feature-updated',
            createdBy: 'test@test.com',
            data: {
                name: 'feature.toggle',
            },
            tags: [{ type: 'jira', value: jiraIssue }],
        },
        {
            baseUrl: jiraBaseUrl,
            user: 'test@test.com',
            apiKey: 'test',
        },
    );
    clock.tick(1000);
    expect(fetchMock.done()).toBe(true);
});
test('Only retries once', async () => {
    const jiraBaseUrl = 'https://test.jira.com';
    const jiraIssue = 'TEST-1';
    const clock = lolex.install();
    const addon = new JiraAddon({
        getLogger: noLogger,
        unleashUrl: 'https://test.unleash.com',
    });
    fetchMock.mock('*', 500, { repeat: 2 });
    await addon.handleEvent(
        {
            type: 'feature-updated',
            createdBy: 'test@test.com',
            data: {
                name: 'feature.toggle',
            },
            tags: [{ type: 'jira', value: jiraIssue }],
        },
        {
            baseUrl: jiraBaseUrl,
            user: 'test@test.com',
            apiKey: 'test',
        },
    );
    clock.tick(1000);
    expect(fetchMock.done()).toBe(true);
});

test('Does not retry if a 4xx error is given', async () => {
    const jiraBaseUrl = 'https://test.jira.com';
    const jiraIssue = 'TEST-1';
    const addon = new JiraAddon({
        getLogger: noLogger,
        unleashUrl: 'https://test.unleash.com',
    });
    fetchMock.once(
        {
            name: 'rejection',
            type: 'POST',
            url: 'begin:https://test.jira.com',
        },
        400,
    );
    await addon.handleEvent(
        {
            type: 'feature-updated',
            createdBy: 'test@test.com',
            data: {
                name: 'feature.toggle',
            },
            tags: [{ type: 'jira', value: jiraIssue }],
        },
        {
            baseUrl: jiraBaseUrl,
            user: 'test@test.com',
            apiKey: 'test',
        },
    );
    expect(fetchMock.done()).toBe(true);
});
