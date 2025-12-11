import type { PlaygroundConstraintSchema } from '../../../../openapi/spec/playground-constraint-schema.js';
import type { PlaygroundSegmentSchema } from '../../../../openapi/spec/playground-segment-schema.js';
import type { StrategyEvaluationResult } from '../client.js';
import { type Constraint, operators } from '../constraint.js';
import type { Context } from '../context.js';
import { selectVariantDefinition, type VariantDefinition } from '../variant.js';

export type SegmentForEvaluation = {
    name: string;
    id: number;
    constraints: Constraint[];
};

export interface StrategyTransportInterface {
    name: string;
    title?: string;
    disabled?: boolean;
    parameters: any;
    constraints: Constraint[];
    variants?: VariantDefinition[];
    segments?: number[];
    id?: string;
}

export interface Segment {
    id: number;
    name: string;
    description?: string;
    constraints: Constraint[];
    createdBy: string;
    createdAt: string;
}

export class Strategy {
    public name: string;

    private returnValue: boolean;

    constructor(name: string, returnValue: boolean = false) {
        this.name = name || 'unknown';
        this.returnValue = returnValue;
    }

    checkConstraint(constraint: Constraint, context: Context): boolean {
        const evaluator = operators.get(constraint.operator);

        if (!evaluator) {
            return false;
        }

        if (constraint.inverted) {
            return !evaluator(constraint, context);
        }

        return evaluator(constraint, context);
    }

    checkConstraints(
        context: Context,
        constraints?: Iterable<Constraint>,
    ): { result: boolean; constraints: PlaygroundConstraintSchema[] } {
        if (!constraints) {
            return {
                result: true,
                constraints: [],
            };
        }

        const mappedConstraints: PlaygroundConstraintSchema[] = [];
        for (const constraint of constraints) {
            if (constraint) {
                mappedConstraints.push({
                    ...constraint,
                    value: constraint?.value?.toString() ?? undefined,
                    result: this.checkConstraint(constraint, context),
                });
            }
        }

        const result = mappedConstraints.every(
            (constraint) => constraint.result,
        );

        return {
            result,
            constraints: mappedConstraints,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isEnabled(_parameters: unknown, _context: Context): boolean {
        return this.returnValue;
    }

    checkSegments(
        context: Context,
        segments: SegmentForEvaluation[],
    ): { result: boolean; segments: PlaygroundSegmentSchema[] } {
        const resolvedSegments = segments.map((segment) => {
            const { result, constraints } = this.checkConstraints(
                context,
                segment.constraints,
            );
            return {
                name: segment.name,
                id: segment.id,
                result,
                constraints,
            };
        });

        return {
            result: resolvedSegments.every((segment) => segment.result),
            segments: resolvedSegments,
        };
    }

    isEnabledWithConstraints(
        parameters: Record<string, unknown>,
        context: Context,
        constraints: Iterable<Constraint>,
        segments: Array<SegmentForEvaluation>,
        disabled?: boolean,
        variantDefinitions?: VariantDefinition[],
    ): StrategyEvaluationResult {
        const constraintResults = this.checkConstraints(context, constraints);
        const enabledResult = this.isEnabled(parameters, context);
        const segmentResults = this.checkSegments(context, segments);

        const overallResult =
            constraintResults.result && enabledResult && segmentResults.result;

        const variantDefinition = variantDefinitions
            ? selectVariantDefinition(
                  parameters.groupId as string,
                  variantDefinitions,
                  context,
              )
            : undefined;
        const variant = variantDefinition
            ? {
                  name: variantDefinition.name,
                  enabled: true,
                  payload: variantDefinition.payload,
              }
            : undefined;

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

        return {
            result: {
                enabled: overallResult,
                evaluationStatus: 'complete',
                variant,
                variants: variant ? variantDefinitions : undefined,
            },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
