import fc, { Arbitrary } from 'fast-check';
import { validateSchema } from '../validate';
import { SdkContextSchema, sdkContextSchema } from './sdk-context-schema';

export const commonISOTimestamp = (): Arbitrary<string> =>
    fc
        .date({
            min: new Date('1900-01-01T00:00:00.000Z'),
            max: new Date('9999-12-31T23:59:59.999Z'),
        })
        .map((x) => x.toISOString());

export const generate = (): Arbitrary<SdkContextSchema> =>
    fc.record(
        {
            appName: fc.string(),
            currentTime: commonISOTimestamp(),
            environment: fc.string(),
            properties: fc.dictionary(fc.string(), fc.string()),
            remoteAddress: fc.ipV4(),
            sessionId: fc.uuid(),
            userId: fc.emailAddress(),
        },
        { requiredKeys: ['appName'] },
    );

test('sdkContextSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: SdkContextSchema) =>
                validateSchema(sdkContextSchema.$id, data) === undefined,
        ),
    ));
