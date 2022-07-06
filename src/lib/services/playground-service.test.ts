import fc from 'fast-check';

import { generateToggles } from '../../lib/routes/admin-api/playground.test';
import { generate as generateContext } from '../../lib/openapi/spec/sdk-context-schema.test';
import { offlineClientFromContext } from './playground-service';
// import { createTestConfig } from '../../test/config/test-config';
// const config: IUnleashConfig = createTestConfig();

describe('the playground service', () => {
    test('should return the same enabled toggles as the raw SDK', async () => {
        await fc.assert(
            fc.asyncProperty(
                generateToggles(),
                generateContext(),
                async (toggles, context) => {
                    // is there a good way to seed toggles here? relying on
                    // generators to generate actual toggles works for the most
                    // part, but might require a lot of work to make strategies
                    // work correctly.

                    //@ts-expect-error
                    const serviceToggles = service.evaluateToggles(
                        toggles,
                        context,
                    );

                    //@ts-expect-error
                    const client = offlineClientFromContext(context, toggles);

                    //@ts-expect-error
                    const sdkToggles = client.getToggles();

                    // If A ⊆ B and B ⊆ A, then A = B
                    expect(sdkToggles).toEqual(
                        expect.arrayContaining(serviceToggles),
                    );
                    expect(serviceToggles).toEqual(
                        expect.arrayContaining(sdkToggles),
                    );

                    // alternatively: sort both lists on same prop and make sure
                    // that sdkToggles[n] deep equals serviceToggles[n]

                    return true;
                },
            ),
        );
    });
});
