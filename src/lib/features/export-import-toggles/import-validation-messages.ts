import {
    FeatureStrategySchema,
    ImportTogglesValidateItemSchema,
} from '../../openapi';
import { IContextFieldDto } from '../../types/stores/context-field-store';

export interface IErrorsParams {
    projectName: string;
    strategies: FeatureStrategySchema[];
    contextFields: IContextFieldDto[];
    otherProjectFeatures: string[];
    duplicateFeatures: string[];
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
    }: IErrorsParams): ImportTogglesValidateItemSchema[] {
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
