import { Box, Chip, styled } from '@mui/material';
import type { FC } from 'react';
import type { FilterItemParamHolder } from 'utils/serializeQueryParams';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{
    isActive?: boolean;
}>(({ theme, isActive = false }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
    height: 'auto',
    ...(isActive && {
        backgroundColor: theme.palette.secondary.light,
        fontWeight: 'bold',
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    }),
    ':focus-visible': {
        outline: `1px solid ${theme.palette.primary.main}`,
        borderColor: theme.palette.primary.main,
    },
}));

interface IChangeRequestFiltersProps {
    tableState: {
        createdBy?: FilterItemParamHolder;
        requestedApprovalBy?: FilterItemParamHolder;
    };
    setTableState: (newState: Partial<{
        createdBy?: FilterItemParamHolder;
        requestedApprovalBy?: FilterItemParamHolder;
    }>) => void;
}

const Wrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    padding: theme.spacing(1.5, 3, 0, 3),
    minHeight: theme.spacing(7),
    gap: theme.spacing(2),
}));

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

const filterOptions = [
    { 
        label: 'Created', 
        key: 'createdBy' as const,
        description: 'Show change requests you created'
    },
    { 
        label: 'Approval Requested', 
        key: 'requestedApprovalBy' as const,
        description: 'Show change requests requesting your approval'
    },
];

export const ChangeRequestFilters: FC<IChangeRequestFiltersProps> = ({
    tableState,
    setTableState,
}) => {
    const { user } = useAuthUser();

    if (!user) return null;

    return (
        <Wrapper>
            <StyledContainer>
                {filterOptions.map(({ label, key, description }) => {
                    const isActive = !!tableState[key]?.values?.includes(user.id.toString());

                    const handleClick = () => {
                        if (isActive) {
                            // Remove active filter (no filter active)
                            setTableState({ 
                                createdBy: null,
                                requestedApprovalBy: null
                            });
                        } else {
                            // Activate this filter and deactivate the other (radio button behavior)
                            setTableState({
                                createdBy: key === 'createdBy' ? {
                                    operator: 'IS',
                                    values: [user.id.toString()],
                                } : null,
                                requestedApprovalBy: key === 'requestedApprovalBy' ? {
                                    operator: 'IS',
                                    values: [user.id.toString()],
                                } : null,
                            });
                        }
                    };

                    return (
                        <StyledChip
                            key={key}
                            label={label}
                            variant='outlined'
                            isActive={isActive}
                            onClick={handleClick}
                            title={description}
                        />
                    );
                })}
            </StyledContainer>
        </Wrapper>
    );
};