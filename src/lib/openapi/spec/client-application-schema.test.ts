import { validateSchema } from '../validate.js';
import type { ClientApplicationSchema } from './client-application-schema.js';

test('clientApplicationSchema no fields', () => {
    expect(
        validateSchema('#/components/schemas/clientApplicationSchema', {}),
    ).toMatchSnapshot();
});

test('clientApplicationSchema required fields', () => {
    const data: ClientApplicationSchema = {
        appName: '',
        interval: 0,
        started: 0,
        strategies: [''],
    };

    expect(
        validateSchema('#/components/schemas/clientApplicationSchema', data),
    ).toBeUndefined();
});

test('clientApplicationSchema all fields', () => {
    const data: ClientApplicationSchema = {
        appName: '',
        instanceId: '',
        sdkVersion: '',
        environment: '',
        interval: 0,
        started: 0,
        strategies: [''],
    };

    expect(
        validateSchema('#/components/schemas/clientApplicationSchema', data),
    ).toBeUndefined();
});

test('clientApplicationSchema go-sdk request', () => {
    const json = `{
        "appName": "x",
        "instanceId": "y",
        "sdkVersion": "unleash-client-go:3.3.1",
        "strategies": [
            "default",
            "applicationHostname",
            "gradualRolloutRandom",
            "gradualRolloutSessionId",
            "gradualRolloutUserId",
            "remoteAddress",
            "flexibleRollout"
        ],
        "started": "2022-06-24T09:59:12.822607943+02:00",
        "interval": 1
    }`;

    expect(
        validateSchema(
            '#/components/schemas/clientApplicationSchema',
            JSON.parse(json),
        ),
    ).toBeUndefined();
});

test('clientApplicationSchema node-sdk request', () => {
    const json = `{
        "appName": "unleash-test-node-appName2",
        "instanceId": "unleash-test-node-instanceId",
        "sdkVersion": "unleash-client-node:3.11.0",
        "strategies": [
            "p",
            "default",
            "applicationHostname",
            "gradualRolloutRandom",
            "gradualRolloutUserId",
            "gradualRolloutSessionId",
            "remoteAddress",
            "flexibleRollout"
        ],
        "started": "2022-06-24T09:54:03.649Z",
        "interval": 1000
    }`;

    expect(
        validateSchema(
            '#/components/schemas/clientApplicationSchema',
            JSON.parse(json),
        ),
    ).toBeUndefined();
});
