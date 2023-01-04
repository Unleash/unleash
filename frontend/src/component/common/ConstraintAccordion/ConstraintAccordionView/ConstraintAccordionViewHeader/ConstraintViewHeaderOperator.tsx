import { IConstraint } from 'interfaces/strategy';
import { ConditionallyRender } from '../../../ConditionallyRender/ConditionallyRender';
import { Tooltip, Box, styled } from '@mui/material';
import { stringOperators } from 'constants/operators';
import { ReactComponent as NegatedIcon } from 'assets/icons/24_Negator.svg';
import { ConstraintOperator } from '../../ConstraintOperator/ConstraintOperator';
import { StyledIconWrapper } from './StyledIconWrapper';
import { ReactComponent as CaseSensitive } from 'assets/icons/24_Text format.svg';
import { oneOf } from 'utils/oneOf';

interface ConstraintViewHeaderOperatorProps {
    constraint: IConstraint;
}

const StyledHeaderValuesContainerWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    margin: 'auto 0',
}));

const StyledHeaderConstraintContainer = styled('div')(({ theme }) => ({
    minWidth: '152px',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
        paddingRight: 0,
    },
}));

export const ConstraintViewHeaderOperator = ({
    constraint,
}: ConstraintViewHeaderOperatorProps) => {
    return (
        <StyledHeaderValuesContainerWrapper>
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
            <StyledHeaderConstraintContainer>
                <ConstraintOperator
                    constraint={constraint}
                    hasPrefix={Boolean(constraint.inverted)}
                />
            </StyledHeaderConstraintContainer>
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
        </StyledHeaderValuesContainerWrapper>
    );
};
