import { afterEach, describe, expect, it } from 'vitest';
import { observeEvents } from './observeEvents.ts';

describe('observeEvents', () => {
    let unsubscribe: (() => void) | undefined;

    afterEach(() => {
        unsubscribe?.();
    });

    const subscribe = (eventNames: string[]) => {
        const received: string[] = [];
        unsubscribe = observeEvents(
            eventNames,
            (name) => received.push(name),
            document,
        );
        return received;
    };

    it('reports the name of a listened event', () => {
        const received = subscribe(['flag-created', 'project-created']);

        document.dispatchEvent(new CustomEvent('project-created'));

        expect(received).toEqual(['project-created']);
    });

    it('ignores events it does not listen for', () => {
        const received = subscribe(['flag-created']);

        document.dispatchEvent(new CustomEvent('project-created'));

        expect(received).toEqual([]);
    });

    it('stops reporting after unsubscribing', () => {
        const received = subscribe(['flag-created']);

        unsubscribe?.();
        document.dispatchEvent(new CustomEvent('flag-created'));

        expect(received).toEqual([]);
    });
});
