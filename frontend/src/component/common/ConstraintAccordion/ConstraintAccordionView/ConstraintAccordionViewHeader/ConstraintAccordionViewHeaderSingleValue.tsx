import React, { useEffect } from 'react';
import { Chip, styled } from '@mui/material';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { IConstraint } from 'interfaces/strategy';
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
}

const StyledHeaderValuesContainerWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    margin: 'auto 0',
}));

export const ConstraintAccordionViewHeaderSingleValue = ({
    constraint,
    allowExpand,
}: ConstraintSingleValueProps) => {
    const { locationSettings } = useLocationSettings();

    useEffect(() => {
        allowExpand(false);
    }, [allowExpand]);

    return (
        <StyledHeaderValuesContainerWrapper>
            <StyledSingleValueChip
                label={formatConstraintValue(constraint, locationSettings)}
            />
        </StyledHeaderValuesContainerWrapper>
    );
};
