import { createRequire } from 'node:module';
import { createTestConfig } from '../../../test/config/test-config.js';
import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import { createFakePrivateProjectChecker } from '../private-project/createPrivateProjectChecker.js';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model.js';
import type { ISegment } from '../../types/model.js';
import type { SdkContextSchema } from '../../openapi/spec/sdk-context-schema.js';
import { omitKeys } from '../../util/index.js';
import { PlaygroundService } from './playground-service.js';

const require = createRequire(import.meta.url);

type ExpectedVariant = {
    name: string;
    enabled: boolean;
    feature_enabled: boolean;
    payload?: { type: string; value: string };
};

type SpecificationCase<ExpectedResult> = {
    description: string;
    // Partial, because the playground requires an appName in the context and
    // most cases only list the context fields they test.
    context: Partial<SdkContextSchema>;
    toggleName: string;
    expectedResult: ExpectedResult;
};

type Specification = {
    name: string;
    state: {
        features: FeatureConfigurationClient[];
        segments?: ISegment[];
    };
    tests?: SpecificationCase<boolean>[];
    variantTests?: SpecificationCase<ExpectedVariant>[];
};

const specificationFiles: string[] = require('@unleash/client-specification/specifications/index.json');

const loadSpecification = (fileName: string): Specification =>
    require(`@unleash/client-specification/specifications/${fileName}`);

// These describe how an SDK applies delta API updates. The playground gets
// its features from the database and never receives deltas.
const specificationsIrrelevantToPlayground = [
    '19-delta-api-hydration.json',
    '20-delta-api-events.json',
];

const casesThePlaygroundCanNotReach = [
    // The SDK turns a strategy off when it points to a segment that does not
    // exist. The playground loads every active segment before it evaluates,
    // so it can not get into that state and does not handle it.
    'F9.withMissingSegment should force evaluation to false',
    // These ask about a feature that is not in the list of features. An SDK
    // answers with "disabled". The playground evaluates the features it is
    // given and can not be asked about any other feature.
    'Unknown feature toggle should be disabled',
    'Feature.Variants.MissingToggle should be disabled missing toggle',
];

specificationFiles
    .filter(
        (fileName) => !specificationsIrrelevantToPlayground.includes(fileName),
    )
    .map(loadSpecification)
    .forEach((specification) => {
        describe(`client specification ${specification.name}`, () => {
            const service = new PlaygroundService(
                createTestConfig(),
                {
                    featureToggleService: {
                        getPlaygroundFeatures: async () =>
                            specification.state.features,
                    },
                    privateProjectChecker: createFakePrivateProjectChecker(),
                },
                new FakeSegmentReadModel(specification.state.segments ?? []),
            );

            const evaluate = async ({
                toggleName,
                context,
            }: SpecificationCase<unknown>) => {
                // The playground can not evaluate without an appName. The
                // specification name is used for the cases that have none,
                // the same as in the Node SDK. A case that tests appName
                // brings its own, and that one has to win.
                const contextWithAppName = {
                    appName: specification.name,
                    ...context,
                };
                const evaluatedFeatures = await service.evaluateQuery(
                    '*',
                    'development',
                    contextWithAppName,
                );

                const evaluatedFeature = evaluatedFeatures.find(
                    (feature) => feature.name === toggleName,
                );
                if (!evaluatedFeature) {
                    throw new Error(
                        `The playground did not evaluate ${toggleName}`,
                    );
                }

                return evaluatedFeature;
            };

            for (const enabledCase of specification.tests ?? []) {
                const skip = casesThePlaygroundCanNotReach.includes(
                    enabledCase.description,
                );

                it(enabledCase.description, { skip }, async () => {
                    const evaluatedFeature = await evaluate(enabledCase);

                    expect(evaluatedFeature.isEnabled).toBe(
                        enabledCase.expectedResult,
                    );
                });
            }

            for (const variantCase of specification.variantTests ?? []) {
                const skip = casesThePlaygroundCanNotReach.includes(
                    variantCase.description,
                );

                it(variantCase.description, { skip }, async () => {
                    const evaluatedFeature = await evaluate(variantCase);

                    const variant = omitKeys(
                        { ...evaluatedFeature.variant },
                        'featureEnabled',
                    );

                    expect(variant).toEqual(variantCase.expectedResult);
                });
            }
        });
    });
