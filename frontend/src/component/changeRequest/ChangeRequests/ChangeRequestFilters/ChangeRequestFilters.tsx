import type { FC } from 'react';
import type { TableState } from '../ChangeRequests.types';
import { makeStyledChip, Wrapper } from './ChangeRequestFilters.styles';
import { UserFilterChips } from './UserFilterChips.tsx';
import { StateFilterChips } from './StateFilterChips.tsx';
import type { ChangeRequestFiltersProps } from './ChangeRequestFilters.types.ts';

export const ChangeRequestFilters: FC<ChangeRequestFiltersProps> = ({
    tableState,
    setTableState,
    userId,
    ariaControlTarget,
}) => {
    const updateTableState = (update: Partial<TableState>) => {
        setTableState({ ...update, offset: 0 });
    };

    const StyledChip = makeStyledChip(ariaControlTarget);

    return (
        <Wrapper>
            <UserFilterChips
                tableState={tableState}
                setTableState={updateTableState}
                userId={userId}
                StyledChip={StyledChip}
            />
            <StateFilterChips
                tableState={tableState}
                setTableState={updateTableState}
                StyledChip={StyledChip}
            />
        </Wrapper>
    );
};
