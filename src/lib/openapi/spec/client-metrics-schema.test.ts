import { validateSchema } from '../validate';
import { ClientMetricsSchema } from './client-metrics-schema';

test('clientMetricsSchema full', () => {
    const data: ClientMetricsSchema = {
        appName: 'a',
        instanceId: 'some-id',
        environment: 'some-env',
        bucket: {
            start: Date.now(),
            stop: Date.now(),
            toggles: {
                someToggle: {
                    yes: 52,
                    no: 2,
                    variants: {},
                },
            },
        },
    };

    expect(
        validateSchema('#/components/schemas/clientMetricsSchema', data),
    ).toBeUndefined();
});

test('clientMetricsSchema should ignore additional properties without failing when required fields are there', () => {
    expect(
        validateSchema('#/components/schemas/clientMetricsSchema', {
            appName: 'a',
            someParam: 'some-value',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {
                    someToggle: {
                        yes: 52,
                        variants: {},
                        someOtherParam: 'some-other-value',
                    },
                },
            },
        }),
    ).toBeUndefined();
});

test('clientMetricsSchema should fail when required field is missing', () => {
    expect(
        validateSchema('#/components/schemas/clientMetricsSchema', {
            appName: 'a',
            bucket: {
                start: Date.now(),
                toggles: {
                    someToggle: {
                        yes: 52,
                        variants: {},
                        someOtherParam: 'some-other-value',
                    },
                },
            },
        }),
    ).toMatchSnapshot();
});
