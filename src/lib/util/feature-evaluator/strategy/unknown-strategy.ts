import { playgroundStrategyEvaluation } from '../../../openapi/spec/playground-strategy-schema';
import { StrategyEvaluationResult } from '../client';
import { Context } from '../context';
import { Constraint, SegmentForEvaluation, Strategy } from './strategy';

export default class UnknownStrategy extends Strategy {
    constructor() {
        super('unknown');
    }

    isEnabled(): boolean {
        return false;
    }

    isEnabledWithConstraints(
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        parameters: any,
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
                reason: 'strategy not found' as 'strategy not found',
                evaluationStatus: 'incomplete',
            },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
