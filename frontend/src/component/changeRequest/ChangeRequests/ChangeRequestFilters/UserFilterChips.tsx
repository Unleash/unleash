import type { FC } from 'react';
import { styled } from '@mui/material';
import { useTracking } from 'hooks/useTracking';
import { useUiFlag } from 'hooks/useUiFlag';
import { useApprovalRequestedCount } from 'hooks/api/getters/useApprovalRequestedCount/useApprovalRequestedCount';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { filterChangeRequestListTracking } from 'component/changeRequest/changeRequestTracking';
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

const StyledDot = styled('span')(({ theme }) => ({
    width: theme.spacing(0.875),
    height: theme.spacing(0.875),
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
}));

const ApprovalRequestedDot: FC<{ className?: string }> = ({ className }) =>
    useApprovalRequestedCount().total ? (
        <StyledDot className={className}>
            <ScreenReaderOnly as='span'>
                Has open change requests:
            </ScreenReaderOnly>
        </StyledDot>
    ) : null;

export const UserFilterChips: FC<UserFilterChipsProps> = ({
    tableState,
    setTableState,
    userId,
    StyledChip,
}) => {
    const userIdString = userId.toString();
    const trackFilterList = useTracking(filterChangeRequestListTracking);
    const improvedSidebarNavigation = useUiFlag('improvedSidebarNavigation');

    const activeUserFilter: UserFilterType | undefined = getUserFilter(
        tableState,
        userIdString,
    );

    const handleUserFilterChange = (filter: UserFilterType) => () => {
        if (filter === activeUserFilter) {
            return;
        }
        trackFilterList('succeeded', { filter });

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
                icon={
                    improvedSidebarNavigation &&
                    activeUserFilter !== 'approval requested' ? (
                        <ApprovalRequestedDot />
                    ) : undefined
                }
                data-selected={activeUserFilter === 'approval requested'}
                onClick={handleUserFilterChange('approval requested')}
                title={'Show change requests requesting your approval'}
            />
        </StyledContainer>
    );
};
