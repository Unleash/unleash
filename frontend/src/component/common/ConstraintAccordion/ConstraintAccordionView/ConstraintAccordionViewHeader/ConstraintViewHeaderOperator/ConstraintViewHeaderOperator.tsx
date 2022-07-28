import { IConstraint } from 'interfaces/strategy';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import { Tooltip, Box } from '@mui/material';
import { stringOperators } from 'constants/operators';
import { ReactComponent as NegatedIcon } from 'assets/icons/24_Negator.svg';
import { ConstraintOperator } from '../../../ConstraintOperator/ConstraintOperator';
import { useStyles } from '../../../ConstraintAccordion.styles';
import { StyledIconWrapper } from '../StyledIconWrapper/StyledIconWrapper';
import { ReactComponent as CaseSensitive } from 'assets/icons/24_Text format.svg';
import { oneOf } from 'utils/oneOf';

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
                        <Box sx={{ display: 'flex' }}>
                            <StyledIconWrapper isPrefix>
                                <NegatedIcon />
                            </StyledIconWrapper>
                        </Box>
                    </Tooltip>
                }
            />
            <div className={styles.headerConstraintContainer}>
                <ConstraintOperator
                    constraint={constraint}
                    hasPrefix={Boolean(constraint.inverted)}
                />
            </div>
            <ConditionallyRender
                condition={
                    !Boolean(constraint.caseInsensitive) &&
                    oneOf(stringOperators, constraint.operator)
                }
                show={
                    <Tooltip title="Case sensitive is active" arrow>
                        <StyledIconWrapper>
                            <CaseSensitive />
                        </StyledIconWrapper>
                    </Tooltip>
                }
            />
        </div>
    );
};
