import React, { useEffect } from 'react';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import { oneOf } from '../../../../../../utils/oneOf';
import { stringOperators } from '../../../../../../constants/operators';
import { Chip, styled, Tooltip } from '@mui/material';
import { ReactComponent as CaseSensitive } from '../../../../../../assets/icons/24_Text format.svg';
import { formatConstraintValue } from '../../../../../../utils/formatConstraintValue';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { StyledIconWrapper } from '../StyledIconWrapper/StyledIconWrapper';
import { IConstraint } from '../../../../../../interfaces/strategy';
import { useLocationSettings } from '../../../../../../hooks/useLocationSettings';

const StyledSingleValueChip = styled(Chip)(({ theme }) => ({
    margin: 'auto 0',
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
            <ConditionallyRender
                condition={
                    !Boolean(constraint.caseInsensitive) &&
                    oneOf(stringOperators, constraint.operator)
                }
                show={
                    <Tooltip title="Case sensitive is active" arrow>
                        <StyledIconWrapper>
                            <CaseSensitive />{' '}
                        </StyledIconWrapper>
                    </Tooltip>
                }
            />
            <StyledSingleValueChip
                label={formatConstraintValue(constraint, locationSettings)}
            />
        </div>
    );
};
