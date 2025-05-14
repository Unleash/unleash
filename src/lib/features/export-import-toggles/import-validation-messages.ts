import type {
    FeatureStrategySchema,
    ImportTogglesValidateItemSchema,
} from '../../openapi/index.js';
import type { IContextFieldDto } from '../context/context-field-store-type.js';
import type { FeatureNameCheckResultWithFeaturePattern } from '../feature-toggle/feature-toggle-service.js';
import type { ProjectFeaturesLimit } from './import-toggles-store-type.js';

export interface IErrorsParams {
    projectName: string;
    strategies: FeatureStrategySchema[];
    contextFields: IContextFieldDto[];
    otherProjectFeatures: string[];
    duplicateFeatures: string[];
    featureNameCheckResult: FeatureNameCheckResultWithFeaturePattern;
    featureLimitResult: ProjectFeaturesLimit;
    segments: string[];
    dependencies: string[];
}

export interface IWarningParams {
    usedCustomStrategies: string[];
    archivedFeatures: string[];
    existingFeatures: string[];
}

export class ImportValidationMessages {
    static compilePermissionErrors(
        missingPermissions: string[],
    ): ImportTogglesValidateItemSchema[] {
        const errors: ImportTogglesValidateItemSchema[] = [];
        if (missingPermissions.length > 0) {
            errors.push({
                message:
                    'We detected you are missing the following permissions:',
                affectedItems: missingPermissions,
            });
        }

        return errors;
    }

    static compileErrors({
        projectName,
        strategies,
        contextFields,
        otherProjectFeatures,
        duplicateFeatures,
        featureNameCheckResult,
        featureLimitResult,
        segments,
        dependencies,
    }: IErrorsParams): ImportTogglesValidateItemSchema[] {
        const errors: ImportTogglesValidateItemSchema[] = [];

        if (strategies.length > 0) {
            errors.push({
                message:
                    'We detected the following custom strategy that needs to be created first:',
                affectedItems: strategies.map((strategy) => strategy.name),
            });
        }
        if (contextFields.length > 0) {
            errors.push({
                message:
                    'We detected the following context fields that do not have matching legal values with the imported ones:',
                affectedItems: contextFields.map(
                    (contextField) => contextField.name,
                ),
            });
        }
        if (otherProjectFeatures.length > 0) {
            errors.push({
                message: `You cannot import a features that already exist in other projects. You already have the following features defined outside of project ${projectName}:`,
                affectedItems: otherProjectFeatures,
            });
        }
        if (duplicateFeatures.length > 0) {
            errors.push({
                message:
                    'We detected the following features are duplicate in your import data:',
                affectedItems: duplicateFeatures,
            });
        }
        if (featureNameCheckResult.state === 'invalid') {
            const baseError = `Features imported into this project must match the project's feature naming pattern: "${featureNameCheckResult.featureNaming.pattern}".`;

            const exampleInfo = featureNameCheckResult.featureNaming.example
                ? ` For example: "${featureNameCheckResult.featureNaming.example}".`
                : '';

            const descriptionInfo = featureNameCheckResult.featureNaming
                .description
                ? ` The pattern is described as follows: "${featureNameCheckResult.featureNaming.description}"`
                : '';

            errors.push({
                message: `${baseError}${exampleInfo}${descriptionInfo} The following features do not match the pattern:`,
                affectedItems: [...featureNameCheckResult.invalidNames].sort(),
            });
        }
        if (
            featureLimitResult.currentFeaturesCount +
                featureLimitResult.newFeaturesCount >
            featureLimitResult.limit
        ) {
            errors.push({
                message: `We detected you want to create ${featureLimitResult.newFeaturesCount} new features to a project that already has ${featureLimitResult.currentFeaturesCount} existing features, exceeding the maximum limit of ${featureLimitResult.limit}.`,
                affectedItems: [],
            });
        }

        if (segments.length > 0) {
            errors.push({
                message:
                    'We detected the following segments that need to be created first:',
                affectedItems: segments,
            });
        }

        if (dependencies.length > 0) {
            errors.push({
                message:
                    'We detected the following dependencies that need to be created first:',
                affectedItems: dependencies,
            });
        }

        return errors;
    }

    static compileWarnings({
        usedCustomStrategies,
        existingFeatures,
        archivedFeatures,
    }: IWarningParams): ImportTogglesValidateItemSchema[] {
        const warnings: ImportTogglesValidateItemSchema[] = [];
        if (usedCustomStrategies.length > 0) {
            warnings.push({
                message:
                    'The following strategy types will be used in import. Please make sure the strategy type parameters are configured as in source environment:',
                affectedItems: usedCustomStrategies,
            });
        }
        if (archivedFeatures.length > 0) {
            warnings.push({
                message:
                    'The following features will not be imported as they are currently archived. To import them, please unarchive them first:',
                affectedItems: archivedFeatures,
            });
        }
        if (existingFeatures.length > 0) {
            warnings.push({
                message:
                    'The following features already exist in this project and will be overwritten:',
                affectedItems: existingFeatures,
            });
        }
        return warnings;
    }
}
