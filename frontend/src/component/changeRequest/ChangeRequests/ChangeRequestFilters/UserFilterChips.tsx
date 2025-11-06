import type { FC } from 'react';
import type { TableState } from '../ChangeRequests.types';
import { StyledContainer } from './ChangeRequestFilters.styles';
import type { FilterChipsProps } from './ChangeRequestFilters.types';

type UserFilterType = 'created' | 'approval requested';

type UserFilterChipsProps = FilterChipsProps & { userId: number };

const getUserFilter = (
    tableState: TableState,
    userId: string,
): UserFilterType | undefined => {
    if (
        !tableState.requestedApproverId &&
        tableState.createdBy?.values.length === 1 &&
        tableState.createdBy.values[0] === userId
    ) {
        return 'created';
    }
    if (
        !tableState.createdBy &&
        tableState.requestedApproverId?.values.length === 1 &&
        tableState.requestedApproverId.values[0] === userId
    ) {
        return 'approval requested';
    }
};

export const UserFilterChips: FC<UserFilterChipsProps> = ({
    tableState,
    setTableState,
    userId,
    StyledChip,
}) => {
    const userIdString = userId.toString();

    const activeUserFilter: UserFilterType | undefined = getUserFilter(
        tableState,
        userIdString,
    );

    const handleUserFilterChange = (filter: UserFilterType) => () => {
        if (filter === activeUserFilter) {
            return;
        }

        const [targetProperty, otherProperty] =
            filter === 'created'
                ? (['createdBy', 'requestedApproverId'] as const)
                : (['requestedApproverId', 'createdBy'] as const);

        setTableState({
            [targetProperty]: {
                operator: 'IS' as const,
                values: [userIdString],
            },
            [otherProperty]:
                tableState[otherProperty]?.values.length === 1 &&
                tableState[otherProperty]?.values[0] === userIdString
                    ? null
                    : tableState[otherProperty],
        });
    };

    return (
        <StyledContainer>
            <StyledChip
                label={'Created by me'}
                data-selected={activeUserFilter === 'created'}
                onClick={handleUserFilterChange('created')}
                title={'Show change requests created by you'}
            />
            <StyledChip
                label={'Approval Requested'}
                data-selected={activeUserFilter === 'approval requested'}
                onClick={handleUserFilterChange('approval requested')}
                title={'Show change requests requesting your approval'}
            />
        </StyledContainer>
    );
};
