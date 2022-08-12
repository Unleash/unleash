import React, { useEffect } from 'react';
import { Chip, styled } from '@mui/material';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { IConstraint } from 'interfaces/strategy';
import { useLocationSettings } from 'hooks/useLocationSettings';

const StyledSingleValueChip = styled(Chip)(({ theme }) => ({
    margin: 'auto 0',
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down(710)]: {
        margin: theme.spacing(1, 0),
    },
}));

interface ConstraintSingleValueProps {
    constraint: IConstraint;
    allowExpand: (shouldExpand: boolean) => void;
}

export const ConstraintAccordionViewHeaderSingleValue = ({
    constraint,
    allowExpand,
}: ConstraintSingleValueProps) => {
    const { locationSettings } = useLocationSettings();
    const { classes: styles } = useStyles();

    useEffect(() => {
        allowExpand(false);
    }, [allowExpand]);

    return (
        <div className={styles.headerValuesContainerWrapper}>
            <StyledSingleValueChip
                label={formatConstraintValue(constraint, locationSettings)}
            />
        </div>
    );
};
