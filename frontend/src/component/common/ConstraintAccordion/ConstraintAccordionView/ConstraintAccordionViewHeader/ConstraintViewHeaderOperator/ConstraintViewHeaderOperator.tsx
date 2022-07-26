import { IConstraint } from '../../../../../../interfaces/strategy';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import { Tooltip } from '@mui/material';
import { ReactComponent as NegatedIcon } from '../../../../../../assets/icons/24_Negator.svg';
import { ConstraintOperator } from '../../../ConstraintOperator/ConstraintOperator';
import React from 'react';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { StyledIconWrapper } from '../StyledIconWrapper/StyledIconWrapper';

interface ConstraintViewHeaderOperatorProps {
    constraint: IConstraint;
}

export const ConstraintViewHeaderOperator = ({
    constraint,
}: ConstraintViewHeaderOperatorProps) => {
    const { classes: styles } = useStyles();

    return (
        <div className={styles.headerValuesContainerWrapper}>
            <ConditionallyRender
                condition={Boolean(constraint.inverted)}
                show={
                    <Tooltip title={'Operator is negated'} arrow>
                        <StyledIconWrapper marginright={'0'}>
                            <NegatedIcon />
                        </StyledIconWrapper>
                    </Tooltip>
                }
            />
            <div className={styles.headerConstraintContainer}>
                <ConstraintOperator constraint={constraint} />
            </div>
        </div>
    );
};
