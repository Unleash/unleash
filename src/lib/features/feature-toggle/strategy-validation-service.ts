import type {
    IConstraint,
    IStrategyConfig,
    IStrategyStore,
    IVariant,
} from '../../types/index.js';
import { WeightType } from '../../types/index.js';
import BadDataError from '../../error/bad-data-error.js';
import { ExceedsLimitError } from '../../error/exceeds-limit-error.js';
import { variantsArraySchema } from '../../schema/feature-schema.js';
import type { IConstraintValidator } from '../constraints/constraint-validator-type.js';
import type { ResourceLimitsService } from '../resource-limits/resource-limits-service.js';
import type { ISegmentService } from '../segment/segment-service-interface.js';
import type { IFeatureStrategiesStore } from './types/feature-toggle-strategies-store-type.js';

export type NormalizedStrategyConfig = Pick<
    IStrategyConfig,
    | 'name'
    | 'title'
    | 'disabled'
    | 'sortOrder'
    | 'constraints'
    | 'parameters'
    | 'variants'
>;

export type StrategyDestination = {
    projectId: string;
    featureName: string;
};

// Doing my best to keep goopy IO nonsense out of this - this should remain
// pure validation as much as possible but still raise appropriate error types
// so that callers can bubble limit errors to the event bus themselves if they care
export class StrategyValidationLimitError extends ExceedsLimitError {
    constructor(
        readonly resource: string,
        readonly limit: number,
        readonly resourceNameOverride?: string,
    ) {
        super(resource, limit);
    }
}

export class StrategyValidationService {
    constructor(
        private readonly dependencies: {
            strategyStore: Pick<IStrategyStore, 'exists'>;
            constraintValidator: IConstraintValidator;
            resourceLimitsService: Pick<
                ResourceLimitsService,
                'getResourceLimits'
            >;
            segmentService: Pick<
                ISegmentService,
                'validateProjectCanAccessSegments'
            >;
            featureStrategiesStore: Pick<
                IFeatureStrategiesStore,
                'getDefaultStickiness'
            >;
        },
    ) {}

    private async validateStrategyType(
        name: string | undefined,
    ): Promise<void> {
        if (
            name !== undefined &&
            !(await this.dependencies.strategyStore.exists(name))
        ) {
            throw new BadDataError(
                `Could not find strategy type with name ${name}`,
            );
        }
    }

    async validateSegmentAccess(
        projectId: string,
        segments?: number[],
    ): Promise<void> {
        await this.dependencies.segmentService.validateProjectCanAccessSegments(
            projectId,
            segments,
        );
    }

    async validateStrategyCount(resultingCount: number): Promise<void> {
        const { featureEnvironmentStrategies: limit } =
            await this.dependencies.resourceLimitsService.getResourceLimits();
        if (resultingCount > limit) {
            throw new StrategyValidationLimitError('strategy', limit);
        }
    }

    async normalize(
        config: IStrategyConfig,
        options: {
            existingConstraints?: IConstraint[];
            destination?: StrategyDestination;
        } = {},
    ): Promise<NormalizedStrategyConfig> {
        await this.validateStrategyType(config.name);
        if (options.destination) {
            await this.validateSegmentAccess(
                options.destination.projectId,
                config.segments,
            );
        }
        const { name, title, disabled, sortOrder } = config;
        let { constraints, parameters, variants } = config;
        if (constraints && constraints.length > 0) {
            await this.validateConstraintsLimit(
                constraints,
                options.existingConstraints ?? [],
            );
            constraints =
                await this.dependencies.constraintValidator.validateConstraints(
                    constraints,
                );
        }

        // Templates omit the destination to preserve placeholders and unresolved defaults.
        if (options.destination) {
            parameters = await this.parametersWithDefaults(
                name,
                parameters,
                options.destination,
            );
        }

        if (variants && variants.length > 0) {
            await variantsArraySchema.validateAsync(variants);
            variants = this.normalizeVariantWeights(variants);
        }

        return {
            name,
            title,
            disabled,
            sortOrder,
            constraints,
            parameters,
            variants,
        };
    }

    private async validateConstraintsLimit(
        updated: IConstraint[],
        existing: IConstraint[],
    ): Promise<void> {
        const { constraints: constraintsLimit, constraintValues: valuesLimit } =
            await this.dependencies.resourceLimitsService.getResourceLimits();
        if (
            updated.length > constraintsLimit &&
            updated.length > existing.length
        ) {
            throw new StrategyValidationLimitError(
                'constraints',
                constraintsLimit,
            );
        }

        const isSameLength = existing.length === updated.length;
        const overLimit = updated.find((constraint, index) => {
            const count = constraint.values?.length ?? 0;
            const existingCount = existing[index]?.values?.length ?? 0;
            const exceeds =
                Array.isArray(constraint.values) && count > valuesLimit;
            return exceeds && !(isSameLength && existingCount >= count);
        });
        if (overLimit) {
            throw new StrategyValidationLimitError(
                `constraint values for ${overLimit.contextName}`,
                valuesLimit,
                'constraint values',
            );
        }
    }

    private async parametersWithDefaults(
        name: string,
        parameters: IStrategyConfig['parameters'],
        { projectId, featureName }: StrategyDestination,
    ): Promise<NonNullable<IStrategyConfig['parameters']>> {
        if (name !== 'flexibleRollout') {
            return parameters ?? {};
        }
        const stickiness =
            !parameters?.stickiness || parameters.stickiness === ''
                ? await this.dependencies.featureStrategiesStore.getDefaultStickiness(
                      projectId,
                  )
                : parameters.stickiness;
        return {
            ...parameters,
            rollout: parameters?.rollout ?? '100',
            stickiness,
            groupId: parameters?.groupId || featureName,
        };
    }

    normalizeVariantWeights(variants: IVariant[]): IVariant[] {
        let variableCount = 0;
        let fixedWeight = 0;
        for (const variant of variants) {
            if (variant.weightType === WeightType.VARIABLE) {
                variableCount += 1;
            } else {
                fixedWeight += variant.weight;
            }
        }
        if (variants.length > 0 && variableCount === 0) {
            throw new BadDataError(
                'There must be at least one "variable" variant',
            );
        }
        if (fixedWeight > 1000) {
            throw new BadDataError(
                'The traffic distribution total must equal 100%',
            );
        }
        const averageWeight = Math.floor((1000 - fixedWeight) / variableCount);
        const remainder = (1000 - fixedWeight) % variableCount;
        let remainingVariables = variableCount;
        // Give the remaining weight units to the alphabetically last variable variants.
        // Gotta put it somewhere, maybe as well put it somewhere stable so that
        // saving this a second time can't move it around unexpectedly.
        return variants
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map((variant) => {
                if (variant.weightType === WeightType.FIX) {
                    return { ...variant };
                }
                const weight =
                    averageWeight + (remainingVariables <= remainder ? 1 : 0);
                remainingVariables -= 1;
                return { ...variant, weight };
            });
    }
}
