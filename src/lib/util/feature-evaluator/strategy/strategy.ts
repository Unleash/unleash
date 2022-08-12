import { PlaygroundConstraintSchema } from 'lib/openapi/spec/playground-constraint-schema';
import { PlaygroundSegmentSchema } from 'lib/openapi/spec/playground-segment-schema';
import { StrategyEvaluationResult } from '../client';
import { Constraint, operators } from '../constraint';
import { Context } from '../context';

export type SegmentForEvaluation = {
    name: string;
    id: number;
    constraints: Constraint[];
};

export interface StrategyTransportInterface {
    name: string;
    parameters: any;
    constraints: Constraint[];
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

        const mappedConstraints = [];
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
    isEnabled(parameters: unknown, context: Context): boolean {
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
            result: resolvedSegments.every(
                (segment) => segment.result === true,
            ),
            segments: resolvedSegments,
        };
    }

    isEnabledWithConstraints(
        parameters: unknown,
        context: Context,
        constraints: Iterable<Constraint>,
        segments: SegmentForEvaluation[],
    ): StrategyEvaluationResult {
        const constraintResults = this.checkConstraints(context, constraints);
        const enabledResult = this.isEnabled(parameters, context);
        const segmentResults = this.checkSegments(context, segments);

        const overallResult =
            constraintResults.result && enabledResult && segmentResults.result;

        return {
            result: { enabled: overallResult, evaluationStatus: 'complete' },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
