import { playgroundStrategyEvaluation } from '../../../../openapi/spec/playground-strategy-schema.js';
import type { StrategyEvaluationResult } from '../client.js';
import type { Constraint } from '../constraint.js';
import type { Context } from '../context.js';
import { type SegmentForEvaluation, Strategy } from './strategy.js';

export default class UnknownStrategy extends Strategy {
    constructor() {
        super('unknown');
    }

    isEnabled(): boolean {
        return false;
    }

    isEnabledWithConstraints(
        _parameters: unknown,
        context: Context,
        constraints: Iterable<Constraint>,
        segments: SegmentForEvaluation[],
    ): StrategyEvaluationResult {
        const constraintResults = this.checkConstraints(context, constraints);
        const segmentResults = this.checkSegments(context, segments);

        const overallResult =
            constraintResults.result && segmentResults.result
                ? playgroundStrategyEvaluation.unknownResult
                : false;

        return {
            result: {
                enabled: overallResult,
                evaluationStatus: 'incomplete',
            },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
