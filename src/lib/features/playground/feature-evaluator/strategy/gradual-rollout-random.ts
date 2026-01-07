import { Strategy } from './strategy.js';
import type { Context } from '../context.js';

export default class GradualRolloutRandomStrategy extends Strategy {
    private randomGenerator: Function = () =>
        Math.floor(Math.random() * 100) + 1;

    constructor(randomGenerator?: Function) {
        super('gradualRolloutRandom');
        this.randomGenerator = randomGenerator || this.randomGenerator;
    }

    isEnabled(
        parameters: { percentage: number | string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _context: Context,
    ): boolean {
        const percentage: number = Number(parameters.percentage);
        const random: number = this.randomGenerator();
        return percentage >= random;
    }
}
