import { playgroundStrategyEvaluation } from '../../../openapi/spec/playground-strategy-schema';
import { StrategyEvaluationResult } from '../client';
import { Constraint } from '../constraint';
import { Context } from '../context';
import { SegmentForEvaluation, Strategy } from './strategy';

export default class UnknownStrategy extends Strategy {
    constructor() {
        super('unknown');
    }

    isEnabled(): boolean {
        return false;
    }

    isEnabledWithConstraints(
        parameters: unknown,
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
