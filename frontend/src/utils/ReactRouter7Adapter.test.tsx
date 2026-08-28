import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import {
    QueryParamProvider,
    StringParam,
    useQueryParam,
} from 'use-query-params';
import { ReactRouter7Adapter } from './ReactRouter7Adapter.tsx';

const TwoParams = () => {
    const [first, setFirst] = useQueryParam('first', StringParam);
    const [second, setSecond] = useQueryParam('second', StringParam);

    return (
        <div>
            <span data-testid='first'>{first}</span>
            <span data-testid='second'>{second}</span>
            <button
                type='button'
                onClick={() => {
                    setFirst('one');
                    setSecond('two');
                }}
            >
                Update both
            </button>
        </div>
    );
};

describe('ReactRouter7Adapter wired through QueryParamProvider', () => {
    it('decodes initial params and applies two same-tick updates without losing either', async () => {
        window.history.replaceState({}, '', '/my-url?first=a&second=b');
        render(
            <BrowserRouter>
                <QueryParamProvider adapter={ReactRouter7Adapter}>
                    <TwoParams />
                </QueryParamProvider>
            </BrowserRouter>,
        );

        expect(screen.getByTestId('first').textContent).toBe('a');
        expect(screen.getByTestId('second').textContent).toBe('b');

        fireEvent.click(screen.getByText('Update both'));

        expect((await screen.findByTestId('first')).textContent).toBe('one');
        expect(screen.getByTestId('second').textContent).toBe('two');
        expect(window.location.search).toBe('?first=one&second=two');
    });
});
