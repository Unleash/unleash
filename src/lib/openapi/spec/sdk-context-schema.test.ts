import fc, { type Arbitrary } from 'fast-check';
import { validateSchema } from '../validate.js';
import {
    type SdkContextSchema,
    sdkContextSchema,
} from './sdk-context-schema.js';
import { commonISOTimestamp } from '../../../test/arbitraries.test.js';

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
