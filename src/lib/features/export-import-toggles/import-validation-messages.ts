import {
    FeatureStrategySchema,
    ImportTogglesValidateItemSchema,
} from '../../openapi';
import { IContextFieldDto } from '../../types/stores/context-field-store';

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

    static compileErrors(
        projectName: string,
        strategies: FeatureStrategySchema[],
        contextFields: IContextFieldDto[],
        segments: string[],
        otherProjectFeatures: string[],
        changeRequestExists: boolean,
    ): ImportTogglesValidateItemSchema[] {
        const errors: ImportTogglesValidateItemSchema[] = [];

        if (strategies.length > 0) {
            errors.push({
                message:
                    'We detected the following custom strategy in the import file that needs to be created first:',
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
        if (segments.length > 0) {
            errors.push({
                message:
                    'We detected the following segments in the import file that need to be created first:',
                affectedItems: segments,
            });
        }
        if (changeRequestExists) {
            errors.push({
                message:
                    'Before importing any data, please resolve your pending change request in this project and environment as it is preventing you from importing at this time',
                affectedItems: [],
            });
        }
        if (otherProjectFeatures.length > 0) {
            errors.push({
                message: `You cannot import a features that already exist in other projects. You already have the following features defined outside of project ${projectName}:`,
                affectedItems: otherProjectFeatures,
            });
        }

        return errors;
    }

    static compileWarnings(
        usedCustomStrategies: string[],
        archivedFeatures: string[],
    ): ImportTogglesValidateItemSchema[] {
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
        return warnings;
    }
}
