import { type MockedFunction, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import userEvent from '@testing-library/user-event';
import { FeaturesOverviewLifecycleFilters } from './FeaturesOverviewLifecycleFilters.tsx';
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
            <FeaturesOverviewLifecycleFilters state={{}} onChange={vi.fn()} />,
        );

        expect(getByText('All lifecycles')).toBeInTheDocument();
        expect(getByText('Develop')).toBeInTheDocument();
        expect(getByText('Rollout production')).toBeInTheDocument();
        expect(getByText('Cleanup')).toBeInTheDocument();
    });

    it('renders all stages with correct counts when no total provided', () => {
        const { getByText } = render(
            <FeaturesOverviewLifecycleFilters state={{}} onChange={vi.fn()} />,
        );

        expect(getByText('All lifecycles')).toBeInTheDocument();
        expect(getByText('10')).toBeInTheDocument();
        expect(getByText('Develop')).toBeInTheDocument();
        expect(getByText('2')).toBeInTheDocument();
        expect(getByText('Rollout production')).toBeInTheDocument();
        expect(getByText('3')).toBeInTheDocument();
        expect(getByText('Cleanup')).toBeInTheDocument();
        expect(getByText('4')).toBeInTheDocument();
    });

    it('will apply a correct filter for each stage', async () => {
        const onChange = vi.fn();
        const { getByText } = render(
            <FeaturesOverviewLifecycleFilters state={{}} onChange={onChange} />,
        );

        await userEvent.click(getByText('Develop'));
        expect(onChange).toHaveBeenCalledWith({
            lifecycle: { operator: 'IS', values: ['pre-live'] },
        });

        await userEvent.click(getByText('Rollout production'));
        expect(onChange).toHaveBeenCalledWith({
            lifecycle: { operator: 'IS', values: ['live'] },
        });

        await userEvent.click(getByText('Cleanup'));
        expect(onChange).toHaveBeenCalledWith({
            lifecycle: { operator: 'IS', values: ['completed'] },
        });

        await userEvent.click(getByText('All lifecycles'));
        expect(onChange).toHaveBeenCalledWith({ lifecycle: null });
    });
});
