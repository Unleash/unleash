const test = require('ava');
const proxyquire = require('proxyquire');
const fetchMock = require('fetch-mock').sandbox();
const lolex = require('lolex');
const noLogger = require('../../test/fixtures/no-logger');

const addonMocked = proxyquire('./addon', { 'node-fetch': fetchMock });
const JiraAddon = proxyquire('./jira-comment', { './addon': addonMocked });
const { addonDefinitionSchema } = require('./addon-schema');

test.beforeEach(() => {
    fetchMock.restore();
    fetchMock.reset();
});

test('Addon definition should validate', t => {
    const { error } = addonDefinitionSchema.validate(JiraAddon.definition);
    t.is(error, undefined);
});

test.serial(
    'An update event should post updated comment with updater and link back to issue',
    async t => {
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
        t.is(fetchMock.calls(true).length, 1);
        t.true(fetchMock.done());
    },
);

test.serial(
    'An event that is tagged with two tags causes two updates',
    async t => {
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
        t.true(fetchMock.done(), 'All routes should be matched');
    },
);

test.serial('An event with no jira tags will be ignored', async t => {
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
    t.is(fetchMock.calls().length, 0); // No calls
});

test.serial('Retries if error code in the 500s', async t => {
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
    t.true(fetchMock.done());
});
test.serial('Only retries once', async t => {
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
    t.true(fetchMock.done());
});

test.serial('Does not retry if a 4xx error is given', async t => {
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
    t.true(fetchMock.done());
});
