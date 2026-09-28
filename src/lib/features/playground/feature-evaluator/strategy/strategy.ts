import type { Context, Strategy as SdkStrategy } from 'unleash-client';
import type { VariantDefinition } from 'unleash-client/lib/variant.js';
import type { PlaygroundConstraintSchema } from '../../../../openapi/spec/playground-constraint-schema.js';
import type { PlaygroundSegmentSchema } from '../../../../openapi/spec/playground-segment-schema.js';
import type { StrategyEvaluationResult } from '../client.js';
import type { Constraint, Segment } from '../feature.js';

export type StrategyEvaluationInput = {
    parameters: Record<string, unknown>;
    context: Context;
    constraints: Constraint[];
    segments: Segment[];
    disabled?: boolean;
    variants?: VariantDefinition[];
};

/**
 * Wraps a Node SDK strategy. The SDK decides whether each constraint
 * matches and whether the strategy is enabled; this class only records
 * those decisions per constraint and per segment so the playground can
 * show them.
 */
export class StrategyExplainer {
    constructor(protected readonly sdkStrategy: SdkStrategy) {}

    get name(): string {
        return this.sdkStrategy.name;
    }

    protected explainConstraints(
        context: Context,
        constraints: Constraint[],
    ): { result: boolean; constraints: PlaygroundConstraintSchema[] } {
        const explained = constraints.map((constraint) => ({
            ...constraint,
            value: constraint.value?.toString() ?? undefined,
            result: this.sdkStrategy.checkConstraint(constraint, context),
        }));

        return {
            result: explained.every((constraint) => constraint.result),
            constraints: explained,
        };
    }

    protected explainSegments(
        context: Context,
        segments: Segment[],
    ): { result: boolean; segments: PlaygroundSegmentSchema[] } {
        const explained = segments.map((segment) => {
            const { result, constraints } = this.explainConstraints(
                context,
                segment.constraints,
            );
            return { name: segment.name, id: segment.id, result, constraints };
        });

        return {
            result: explained.every((segment) => segment.result),
            segments: explained,
        };
    }

    explain({
        parameters,
        context,
        constraints,
        segments,
        disabled,
        variants,
    }: StrategyEvaluationInput): StrategyEvaluationResult {
        const constraintResults = this.explainConstraints(context, constraints);
        const segmentResults = this.explainSegments(context, segments);

        if (disabled) {
            return {
                result: {
                    enabled: 'unknown',
                    evaluationStatus: 'unevaluated',
                },
                constraints: constraintResults.constraints,
                segments: segmentResults.segments,
            };
        }

        const allConstraints = [
            ...constraints,
            ...segments.flatMap((segment) => segment.constraints),
        ];
        const sdkResult = this.sdkStrategy.getResult(
            parameters,
            context,
            allConstraints.values(),
            variants,
        );

        return {
            result: {
                enabled: sdkResult.enabled,
                evaluationStatus: 'complete',
                variant: sdkResult.enabled ? sdkResult.variant : undefined,
                variants:
                    sdkResult.enabled && sdkResult.variant
                        ? variants
                        : undefined,
            },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
