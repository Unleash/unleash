import { expect, test } from 'vitest';
import type { StrategyFormState } from 'interfaces/strategy';
import { strategyShapeProps, summarizeStrategy } from './summarizeStrategy.ts';

test('never reports a custom strategy name', () => {
    const custom: StrategyFormState = { name: 'our-internal-rollout' };

    expect(strategyShapeProps(custom)).toMatchObject({
        strategyType: 'custom',
    });
    expect(summarizeStrategy(custom)).toMatchObject({
        strategyType: 'custom',
    });
});
