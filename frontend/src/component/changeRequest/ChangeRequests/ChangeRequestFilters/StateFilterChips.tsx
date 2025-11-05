import type { FC } from 'react';
import { StyledContainer } from './ChangeRequestFilters.styles';
import type { FilterChipsProps } from './ChangeRequestFilters.types';

type StateFilterType = 'open' | 'closed';

const getStateFilter = (
    stateValue: string | undefined,
): StateFilterType | undefined => {
    if (stateValue === 'open') {
        return 'open';
    }
    if (stateValue === 'closed') {
        return 'closed';
    }
};

export const StateFilterChips: FC<FilterChipsProps> = ({
    tableState,
    setTableState,
    StyledChip,
}) => {
    const activeStateFilter = getStateFilter(tableState.state?.values?.[0]);

    const handleStateFilterChange = (filter: StateFilterType) => () => {
        if (filter === activeStateFilter) {
            return;
        }
        setTableState({ state: { operator: 'IS' as const, values: [filter] } });
    };

    return (
        <StyledContainer>
            <StyledChip
                label={'Open'}
                data-selected={activeStateFilter === 'open'}
                onClick={handleStateFilterChange('open')}
                title={'Show open change requests'}
            />
            <StyledChip
                label={'Closed'}
                data-selected={activeStateFilter === 'closed'}
                onClick={handleStateFilterChange('closed')}
                title={'Show closed change requests'}
            />
        </StyledContainer>
    );
};
