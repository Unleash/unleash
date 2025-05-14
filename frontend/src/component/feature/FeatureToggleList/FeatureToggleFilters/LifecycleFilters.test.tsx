import { type MockedFunction, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import userEvent from '@testing-library/user-event';
import { LifecycleFilters } from './LifecycleFilters.tsx';
import { useLifecycleCount } from 'hooks/api/getters/useLifecycleCount/useLifecycleCount';

vi.mock('hooks/api/getters/useLifecycleCount/useLifecycleCount');

const mockUseLifecycleCount = useLifecycleCount as MockedFunction<
    typeof useLifecycleCount
>;

describe('LifecycleFilters', () => {
    beforeEach(() => {
        mockUseLifecycleCount.mockReturnValue({
            lifecycleCount: {
                initial: 1,
                preLive: 2,
                live: 3,
                completed: 4,
                archived: 0,
            },
            error: undefined,
            loading: false,
        });
    });

    it('renders labels without count if lifecycle count is not available', async () => {
        mockUseLifecycleCount.mockReturnValue({
            lifecycleCount: undefined,
            error: undefined,
            loading: true,
        });

        const { getByText } = render(
            <LifecycleFilters state={{}} onChange={vi.fn()} />,
        );

        expect(getByText('All flags')).toBeInTheDocument();
        expect(getByText('Develop')).toBeInTheDocument();
        expect(getByText('Rollout production')).toBeInTheDocument();
        expect(getByText('Cleanup')).toBeInTheDocument();
    });

    it('renders all stages with correct counts when no total provided', () => {
        const { getByText } = render(
            <LifecycleFilters state={{}} onChange={vi.fn()} />,
        );

        expect(getByText('All flags (10)')).toBeInTheDocument();
        expect(getByText('Develop (2)')).toBeInTheDocument();
        expect(getByText('Rollout production (3)')).toBeInTheDocument();
        expect(getByText('Cleanup (4)')).toBeInTheDocument();
    });

    it('renders dynamic label when total matches count', () => {
        const total = 3;
        const { getByText } = render(
            <LifecycleFilters
                state={{ lifecycle: { operator: 'IS', values: ['live'] } }}
                onChange={vi.fn()}
                total={total}
            />,
        );
        expect(getByText('Rollout production (3)')).toBeInTheDocument();
    });

    it('renders dynamic label when total does not match count', () => {
        const total = 2;
        const { getByText } = render(
            <LifecycleFilters
                state={{ lifecycle: { operator: 'IS', values: ['live'] } }}
                onChange={vi.fn()}
                total={total}
            />,
        );
        expect(getByText('Rollout production (2 of 3)')).toBeInTheDocument();
    });

    it('will apply a correct filter for each stage', async () => {
        const onChange = vi.fn();
        const { getByText } = render(
            <LifecycleFilters state={{}} onChange={onChange} />,
        );

        await userEvent.click(getByText('Develop (2)'));
        expect(onChange).toHaveBeenCalledWith({
            lifecycle: { operator: 'IS', values: ['pre-live'] },
        });

        await userEvent.click(getByText('Rollout production (3)'));
        expect(onChange).toHaveBeenCalledWith({
            lifecycle: { operator: 'IS', values: ['live'] },
        });

        await userEvent.click(getByText('Cleanup (4)'));
        expect(onChange).toHaveBeenCalledWith({
            lifecycle: { operator: 'IS', values: ['completed'] },
        });

        await userEvent.click(getByText('All flags (10)'));
        expect(onChange).toHaveBeenCalledWith({ lifecycle: null });
    });
});
