import { Box, Chip, styled } from '@mui/material';
import { useState, type FC } from 'react';

const StyledChip = styled(Chip)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
    height: 'auto',
    '&[aria-current="true"]': {
        backgroundColor: theme.palette.secondary.light,
        fontWeight: 'bold',
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    },
    ':focus-visible': {
        outline: `1px solid ${theme.palette.primary.main}`,
        borderColor: theme.palette.primary.main,
    },
}));

export type ChangeRequestQuickFilter = 'Created' | 'Approval Requested';

interface IChangeRequestFiltersProps {
    ariaControlTarget: string;
    initialSelection?: ChangeRequestQuickFilter;
    onSelectionChange: (selection: ChangeRequestQuickFilter) => void;
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

export const ChangeRequestFilters: FC<IChangeRequestFiltersProps> = ({
    onSelectionChange,
    initialSelection,
    ariaControlTarget,
}) => {
    const [selected, setSelected] = useState<ChangeRequestQuickFilter>(
        initialSelection || 'Created',
    );
    const handleSelectionChange = (value: ChangeRequestQuickFilter) => () => {
        if (value === selected) {
            return;
        }
        setSelected(value);
        onSelectionChange(value);
    };

    return (
        <Wrapper>
            <StyledContainer>
                <StyledChip
                    label={'Created'}
                    variant='outlined'
                    aria-current={selected === 'Created'}
                    aria-controls={ariaControlTarget}
                    onClick={handleSelectionChange('Created')}
                    title={'Show change requests created by you'}
                />
                <StyledChip
                    label={'Approval Requested'}
                    variant='outlined'
                    aria-current={selected === 'Approval Requested'}
                    aria-controls={ariaControlTarget}
                    onClick={handleSelectionChange('Approval Requested')}
                    title={'Show change requests requesting your approval'}
                />
            </StyledContainer>
        </Wrapper>
    );
};
