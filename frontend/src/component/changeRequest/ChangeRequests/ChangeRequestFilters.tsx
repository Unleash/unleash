import { Box, Chip, styled, type ChipProps } from '@mui/material';
import { useState, type FC } from 'react';

const makeStyledChip = (ariaControlTarget: string) =>
    styled(({ ...props }: ChipProps) => (
        <Chip variant='outlined' aria-controls={ariaControlTarget} {...props} />
    ))<ChipProps>(({ theme, label }) => ({
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

        borderRadius: 0,
        '&:first-of-type': {
            borderTopLeftRadius: theme.shape.borderRadius,
            borderBottomLeftRadius: theme.shape.borderRadius,
        },
        '&:last-of-type': {
            borderTopRightRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
        },

        '& .MuiChip-label': {
            position: 'relative',
            textAlign: 'center',
            '&::before': {
                content: `'${label}'`,
                fontWeight: 'bold',
                visibility: 'hidden',
                height: 0,
                display: 'block',
                overflow: 'hidden',
                userSelect: 'none',
            },
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

const StyledContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
});

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

    const StyledChip = makeStyledChip(ariaControlTarget);

    return (
        <Wrapper>
            <StyledContainer>
                <StyledChip
                    label={'Created'}
                    aria-current={selected === 'Created'}
                    onClick={handleSelectionChange('Created')}
                    title={'Show change requests created by you'}
                />
                <StyledChip
                    label={'Approval Requested'}
                    aria-current={selected === 'Approval Requested'}
                    onClick={handleSelectionChange('Approval Requested')}
                    title={'Show change requests requesting your approval'}
                />
            </StyledContainer>
        </Wrapper>
    );
};
