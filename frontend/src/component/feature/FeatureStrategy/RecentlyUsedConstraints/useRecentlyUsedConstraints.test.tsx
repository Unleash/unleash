import {
    useRecentlyUsedConstraints,
    areConstraintsEqual,
} from './useRecentlyUsedConstraints';
import { renderHook, act } from '@testing-library/react';
import type { IConstraint } from 'interfaces/strategy';
import { IN, STR_CONTAINS } from 'constants/operators';
import type { Operator } from 'constants/operators';

const createTestConstraint = (
    contextName: string,
    operator: Operator = IN,
    values = [contextName],
): IConstraint => ({
    contextName,
    operator,
    values,
});

describe('areConstraintsEqual', () => {
    it('should return true for constraints with identical content', () => {
        const constraint1: IConstraint = {
            contextName: 'userId',
            operator: IN,
            values: ['user1', 'user2'],
            inverted: false,
        };

        const constraint2: IConstraint = {
            contextName: 'userId',
            operator: IN,
            values: ['user1', 'user2'],
            inverted: false,
        };

        expect(areConstraintsEqual(constraint1, constraint2)).toBe(true);
    });

    it('should return false for constraints with different content', () => {
        const constraint1: IConstraint = {
            contextName: 'userId',
            operator: IN,
            values: ['user1', 'user2'],
        };

        const constraint2: IConstraint = {
            contextName: 'userId',
            operator: IN,
            values: ['user1', 'user3'],
        };

        expect(areConstraintsEqual(constraint1, constraint2)).toBe(false);
    });

    it('should return false for constraints with different operators', () => {
        const constraint1: IConstraint = {
            contextName: 'userId',
            operator: IN,
            values: ['user1'],
        };

        const constraint2: IConstraint = {
            contextName: 'userId',
            operator: STR_CONTAINS,
            values: ['user1'],
        };

        expect(areConstraintsEqual(constraint1, constraint2)).toBe(false);
    });
});

describe('useRecentlyUsedConstraints', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('should initialize with empty array when no items in localStorage', () => {
        const { result } = renderHook(() =>
            useRecentlyUsedConstraints('test-key'),
        );

        expect(result.current.items).toEqual([]);
    });

    it('should initialize with initial items if provided', () => {
        const initialItems = [createTestConstraint('userId')];
        const { result } = renderHook(() =>
            useRecentlyUsedConstraints('test-key', initialItems),
        );

        expect(result.current.items).toEqual(initialItems);
    });

    it('should add new items to the beginning of the list', () => {
        const { result } = renderHook(() =>
            useRecentlyUsedConstraints('test-key'),
        );

        act(() => {
            result.current.addItem(createTestConstraint('userId'));
        });
        expect(result.current.items[0].contextName).toBe('userId');

        act(() => {
            result.current.addItem(createTestConstraint('email'));
        });
        expect(result.current.items[0].contextName).toBe('email');
        expect(result.current.items[1].contextName).toBe('userId');
    });

    it('should limit stored items to maximum of 3', () => {
        const { result } = renderHook(() =>
            useRecentlyUsedConstraints('test-key'),
        );

        act(() => {
            result.current.addItem(createTestConstraint('userId'));
            result.current.addItem(createTestConstraint('email'));
            result.current.addItem(createTestConstraint('countryId'));
            result.current.addItem(createTestConstraint('appName'));
        });

        expect(result.current.items.length).toBe(3);
        expect(result.current.items[0].contextName).toBe('appName');
        expect(result.current.items[1].contextName).toBe('countryId');
        expect(result.current.items[2].contextName).toBe('email');
    });

    it('should not add duplicate constraints', () => {
        const { result } = renderHook(() =>
            useRecentlyUsedConstraints('test-key'),
        );

        const constraint1 = createTestConstraint('userId', IN, [
            'user1',
            'user2',
        ]);
        const constraint2 = createTestConstraint('email');

        act(() => {
            result.current.addItem(constraint1);
            result.current.addItem(constraint2);
        });
        expect(result.current.items.length).toBe(2);

        const duplicateConstraint = createTestConstraint('userId', IN, [
            'user1',
            'user2',
        ]);
        act(() => {
            result.current.addItem(duplicateConstraint);
        });

        expect(result.current.items.length).toBe(2);
        expect(result.current.items[0].contextName).toBe('userId');
        expect(result.current.items[1].contextName).toBe('email');
    });

    it('should persist items to localStorage', () => {
        const { result } = renderHook(() =>
            useRecentlyUsedConstraints('test-key'),
        );

        act(() => {
            result.current.addItem(createTestConstraint('userId'));
        });

        const { result: newResult } = renderHook(() =>
            useRecentlyUsedConstraints('test-key'),
        );

        expect(newResult.current.items[0].contextName).toBe('userId');
    });
});
