import { UnleashError } from './unleash-error.js';
import type { SessionTimeoutReason } from '../types/session-timeout-reason.js';

const MESSAGES: Record<SessionTimeoutReason, string> = {
    idle: 'Your session ended because you were inactive. Please log in again.',
    max_age:
        'Your session reached the maximum length allowed. Please log in again.',
    unknown_start: 'Your session has ended. Please log in again.',
};

export class SessionEndedError extends UnleashError {
    statusCode = 401;

    reason: SessionTimeoutReason;

    constructor(reason: SessionTimeoutReason) {
        super(MESSAGES[reason], 'SessionEndedError');
        this.reason = reason;
    }

    toJSON(): ReturnType<UnleashError['toJSON']> & {
        reason: SessionTimeoutReason;
    } {
        return { ...super.toJSON(), reason: this.reason };
    }
}
