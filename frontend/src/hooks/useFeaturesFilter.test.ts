import { renderHook, act } from '@testing-library/react-hooks';
import { useFeaturesFilter } from 'hooks/useFeaturesFilter';
import { IConstraint, IFeatureStrategy } from 'interfaces/strategy';
import { FeatureSchema } from 'openapi';
import parseISO from 'date-fns/parseISO';

test('useFeaturesFilter empty', () => {
    const { result } = renderHook(() => useFeaturesFilter([]));

    expect(result.current.filtered.length).toEqual(0);
    expect(result.current).toMatchSnapshot();
});

test('useFeaturesFilter equal', () => {
    const { result } = renderHook(() =>
        useFeaturesFilter([
            mockFeatureToggle(),
            mockFeatureToggle(),
            mockFeatureToggle(),
        ])
    );

    expect(result.current.filtered.length).toEqual(3);
    expect(result.current).toMatchSnapshot();
});

test('useFeaturesFilter project', () => {
    const { result } = renderHook(() =>
        useFeaturesFilter([
            mockFeatureToggle({ project: '1' }),
            mockFeatureToggle({ project: '2' }),
            mockFeatureToggle({ project: '2' }),
            mockFeatureToggle({ project: '3' }),
        ])
    );

    act(() => {
        result.current.setFilter({ project: '2' });
    });

    expect(result.current.filtered.length).toEqual(2);
    expect(result.current).toMatchSnapshot();
});

test('useFeaturesFilter query', () => {
    const { result } = renderHook(() =>
        useFeaturesFilter([
            mockFeatureToggle({ project: 'a' }),
            mockFeatureToggle({ project: 'ab' }),
            mockFeatureToggle({ project: 'abc' }),
            mockFeatureToggle({ project: 'abcd' }),
        ])
    );

    act(() => {
        result.current.setFilter({ project: '*', query: 'bc' });
    });

    expect(result.current.filtered.length).toEqual(2);
    expect(result.current).toMatchSnapshot();
});

test('useFeaturesFilter constraints', () => {
    const { result } = renderHook(() =>
        useFeaturesFilter([
            mockFeatureToggle({
                project: 'a',
                strategies: [
                    mockFeatureStrategy(),
                    mockFeatureStrategy(),
                    mockFeatureStrategy({
                        constraints: [
                            mockConstraint(),
                            mockConstraint({ value: 'xyz' }),
                            mockConstraint({ values: ['xyz'] }),
                        ],
                    }),
                ],
            }),
        ])
    );

    act(() => {
        result.current.setFilter({ project: '*', query: 'xyz' });
    });

    expect(result.current.filtered.length).toEqual(1);
    expect(result.current).toMatchSnapshot();
});

const mockFeatureToggle = (
    overrides?: Partial<FeatureSchema>
): FeatureSchema => {
    return {
        name: '1',
        description: '1',
        type: '1',
        project: '1',
        enabled: false,
        stale: false,
        impressionData: false,
        strategies: [],
        variants: [],
        createdAt: parseISO('2006-01-02T15:04:05Z'),
        lastSeenAt: parseISO('2006-01-02T15:04:05Z'),
        ...overrides,
    };
};

const mockFeatureStrategy = (
    overrides?: Partial<IFeatureStrategy>
): IFeatureStrategy => {
    return {
        id: '1',
        name: '1',
        constraints: [],
        parameters: {},
        ...overrides,
    };
};

const mockConstraint = (overrides?: Partial<IConstraint>): IConstraint => {
    return {
        contextName: '',
        operator: 'IN',
        ...overrides,
    };
};
