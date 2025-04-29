import { Strategy } from './strategy.js';

export default class DefaultStrategy extends Strategy {
    constructor() {
        super('default');
    }

    isEnabled(): boolean {
        return true;
    }
}
