import { useEffect } from 'react';
import { Chip, styled } from '@mui/material';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import type { IConstraint } from 'interfaces/strategy';
import { useLocationSettings } from 'hooks/useLocationSettings';

const StyledSingleValueChip = styled(Chip)(({ theme }) => ({
    margin: 'auto 0',
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(1, 0),
    },
}));

interface ConstraintSingleValueProps {
    constraint: IConstraint;
    allowExpand: (shouldExpand: boolean) => void;
    disabled?: boolean;
}

const StyledHeaderValuesContainerWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    margin: 'auto 0',
}));

export const ConstraintAccordionViewHeaderSingleValue = ({
    constraint,
    allowExpand,
    disabled = false,
}: ConstraintSingleValueProps) => {
    const { locationSettings } = useLocationSettings();

    useEffect(() => {
        allowExpand(false);
    }, [allowExpand]);

    return (
        <StyledHeaderValuesContainerWrapper>
            <StyledSingleValueChip
                sx={(theme) => ({
                    color: disabled ? theme.palette.text.secondary : 'inherit',
                })}
                label={formatConstraintValue(constraint, locationSettings)}
            />
        </StyledHeaderValuesContainerWrapper>
    );
};
