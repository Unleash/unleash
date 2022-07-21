import fc, { Arbitrary } from 'fast-check';
import { validateSchema } from '../validate';
import { SdkContextSchema, sdkContextSchema } from './sdk-context-schema';
import { commonISOTimestamp } from '../../../test/arbitraries.test';

export const generate = (): Arbitrary<SdkContextSchema> =>
    fc.record(
        {
            appName: fc.string({ minLength: 1 }),
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
