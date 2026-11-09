import { Strategy as SdkStrategy } from 'unleash-client';
import { playgroundStrategyEvaluation } from '../../../../openapi/spec/playground-strategy-schema.js';
import type { StrategyEvaluationResult } from '../client.js';
import { type StrategyEvaluationInput, StrategyExplainer } from './strategy.js';

/**
 * Used for strategies the playground cannot evaluate offline: custom
 * strategies and applicationHostname. Constraints and segments are still
 * explained; the strategy itself reports 'unknown'.
 */
export class UnknownStrategyExplainer extends StrategyExplainer {
    constructor() {
        super(new SdkStrategy('unknown'));
    }

    explain({
        context,
        constraints,
        segments,
    }: StrategyEvaluationInput): StrategyEvaluationResult {
        const constraintResults = this.explainConstraints(context, constraints);
        const segmentResults = this.explainSegments(context, segments);

        return {
            result: {
                enabled:
                    constraintResults.result && segmentResults.result
                        ? playgroundStrategyEvaluation.unknownResult
                        : false,
                evaluationStatus: 'incomplete',
            },
            constraints: constraintResults.constraints,
            segments: segmentResults.segments,
        };
    }
}
