import fc, { type Arbitrary } from 'fast-check';
import { commonISOTimestamp } from '../../../test/arbitraries.js';
import type { SdkContextSchema } from './sdk-context-schema.js';

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
