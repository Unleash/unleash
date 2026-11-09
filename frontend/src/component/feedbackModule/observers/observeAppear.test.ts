import { afterEach, describe, expect, it } from 'vitest';
import { observeAppear } from './observeAppear.ts';

const nextMutationBatch = () => new Promise((resolve) => setTimeout(resolve));

describe('observeAppear', () => {
    let unsubscribe: (() => void) | undefined;

    afterEach(() => {
        unsubscribe?.();
        document.body.innerHTML = '';
    });

    const subscribe = () => {
        const appeared: Element[] = [];
        unsubscribe = observeAppear(
            (added) => appeared.push(added),
            document.body,
        );
        return appeared;
    };

    const append = (html: string): Element => {
        const container = document.createElement('div');
        container.innerHTML = html;
        const added = container.firstElementChild!;
        document.body.append(added);
        return added;
    };

    it('reports the root of an added subtree', async () => {
        const appeared = subscribe();

        const toast = append('<div role="alert"><p>Flag created</p></div>');
        await nextMutationBatch();

        expect(appeared).toEqual([toast]);
    });

    it('reports an element added deep inside existing content', async () => {
        document.body.innerHTML = '<main><section></section></main>';
        const appeared = subscribe();

        const paragraph = document.createElement('p');
        document.querySelector('section')!.append(paragraph);
        await nextMutationBatch();

        expect(appeared).toEqual([paragraph]);
    });

    it('does not report content present at install', async () => {
        document.body.innerHTML = '<div role="alert">Flag created</div>';
        const appeared = subscribe();

        await nextMutationBatch();

        expect(appeared).toEqual([]);
    });

    it('does not report text nodes', async () => {
        const appeared = subscribe();

        document.body.append('Flag created');
        await nextMutationBatch();

        expect(appeared).toEqual([]);
    });

    it.each([
        'script',
        'style',
        'template',
        'noscript',
    ])('does not report a %s element', async (tag) => {
        const appeared = subscribe();

        append(`<${tag}></${tag}>`);
        await nextMutationBatch();

        expect(appeared).toEqual([]);
    });

    it.each([
        ['a hidden element', '<div hidden>Flag created</div>'],
        [
            'an element hidden from assistive technology',
            '<div aria-hidden="true">Flag created</div>',
        ],
    ])('does not report %s', async (_, html) => {
        const appeared = subscribe();

        append(html);
        await nextMutationBatch();

        expect(appeared).toEqual([]);
    });

    it('does not report an element added inside hidden content present at install', async () => {
        document.body.innerHTML = '<div hidden></div>';
        const appeared = subscribe();

        document.querySelector('[hidden]')!.append(document.createElement('p'));
        await nextMutationBatch();

        expect(appeared).toEqual([]);
    });

    it('does not report an element removed before the batch is delivered', async () => {
        const appeared = subscribe();

        append('<div role="alert">Flag created</div>').remove();
        await nextMutationBatch();

        expect(appeared).toEqual([]);
    });

    it('stops reporting after unsubscribing', async () => {
        const appeared = subscribe();

        unsubscribe?.();
        append('<div role="alert">Flag created</div>');
        await nextMutationBatch();

        expect(appeared).toEqual([]);
    });
});
