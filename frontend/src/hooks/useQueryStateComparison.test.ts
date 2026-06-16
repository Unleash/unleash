import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { StringParam } from 'use-query-params';
import { createParser } from 'nuqs';
import { useQueryStateComparison } from './useQueryStateComparison.ts';
import { recordQueryStateDivergence } from '../utils/recordQueryStateDivergence.ts';
import {
    stringQueryParam,
    type QueryParamSpec,
} from '../utils/queryParamSpec.ts';

vi.mock('../utils/recordQueryStateDivergence.ts', () => ({
    recordQueryStateDivergence: vi.fn(),
}));

// Direct unit test of the comparison hook: it receives both libraries'
// already-decoded state and the specs, so we can exercise it without a
// router or the dual-run facade (that integration path is tested in PR4).
const standardSpecs = { query: stringQueryParam };

/** Decodes the same but serializes differently, to force encode divergence. */
const encodeDivergentSpec: QueryParamSpec<string | null | undefined> = {
    uqp: StringParam,
    nuqs: createParser({
        parse: (value) => value,
        serialize: (value) => `${value}!`,
    }),
};

describe('useQueryStateComparison', () => {
    beforeEach(() => {
        vi.mocked(recordQueryStateDivergence).mockClear();
    });

    it('does nothing when disabled, even if the states differ', () => {
        renderHook(() =>
            useQueryStateComparison({
                enabled: false,
                source: 'test',
                specs: standardSpecs,
                uqpState: { query: 'a' },
                nuqsState: { query: 'b' },
            }),
        );

        expect(recordQueryStateDivergence).not.toHaveBeenCalled();
    });

    it('does not report when both libraries agree', () => {
        renderHook(() =>
            useQueryStateComparison({
                enabled: true,
                source: 'test',
                specs: standardSpecs,
                uqpState: { query: 'a' },
                nuqsState: { query: 'a' },
            }),
        );

        expect(recordQueryStateDivergence).not.toHaveBeenCalled();
    });

    it('treats undefined and null as the same (absent)', () => {
        renderHook(() =>
            useQueryStateComparison({
                enabled: true,
                source: 'test',
                specs: standardSpecs,
                uqpState: { query: undefined },
                nuqsState: { query: null },
            }),
        );

        expect(recordQueryStateDivergence).not.toHaveBeenCalled();
    });

    it('reports decode divergence with the diverging keys only', () => {
        renderHook(() =>
            useQueryStateComparison({
                enabled: true,
                source: 'test',
                specs: { query: stringQueryParam, stable: stringQueryParam },
                uqpState: { query: 'a', stable: 'same' },
                nuqsState: { query: 'b', stable: 'same' },
            }),
        );

        expect(recordQueryStateDivergence).toHaveBeenCalledWith({
            source: 'test',
            kind: 'decode',
            keys: ['query'],
        });
    });

    it('reports encode divergence when the decoded states agree', () => {
        renderHook(() =>
            useQueryStateComparison({
                enabled: true,
                source: 'test',
                specs: { query: encodeDivergentSpec },
                uqpState: { query: 'a' },
                nuqsState: { query: 'a' },
            }),
        );

        expect(recordQueryStateDivergence).toHaveBeenCalledWith({
            source: 'test',
            kind: 'encode',
            keys: ['query'],
        });
    });
});
