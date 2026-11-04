import { afterEach, describe, expect, it } from 'vitest';
import { observeClicks } from './observeClicks.ts';

describe('observeClicks', () => {
    let unsubscribe: (() => void) | undefined;

    afterEach(() => {
        unsubscribe?.();
        document.body.innerHTML = '';
    });

    const subscribe = () => {
        const clicked: Element[] = [];
        unsubscribe = observeClicks((target) => clicked.push(target), document);
        return clicked;
    };

    it('reports the clicked element', () => {
        document.body.innerHTML = '<button>Create flag</button>';
        const button = document.querySelector('button')!;
        const clicked = subscribe();

        button.click();

        expect(clicked).toEqual([button]);
    });

    it('reports a click whose handler stops propagation', () => {
        document.body.innerHTML = '<button>Create flag</button>';
        const button = document.querySelector('button')!;
        button.addEventListener('click', (event) => event.stopPropagation());
        const clicked = subscribe();

        button.click();

        expect(clicked).toEqual([button]);
    });

    it('stops reporting after unsubscribing', () => {
        document.body.innerHTML = '<button>Create flag</button>';
        const clicked = subscribe();

        unsubscribe?.();
        document.querySelector('button')!.click();

        expect(clicked).toEqual([]);
    });
});
