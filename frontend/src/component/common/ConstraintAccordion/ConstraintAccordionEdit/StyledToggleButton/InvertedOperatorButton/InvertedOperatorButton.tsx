import { Box, Tooltip } from '@mui/material';
import { ReactComponent as NegatedIcon } from 'assets/icons/not_operator_selected.svg';
import { ReactComponent as NegatedIconOff } from 'assets/icons/not_operator_unselected.svg';
import { IConstraint } from 'interfaces/strategy';
import {
    StyledToggleButtonOff,
    StyledToggleButtonOn,
} from '../StyledToggleButton';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';

interface InvertedOperatorButtonProps {
    localConstraint: IConstraint;
    setInvertedOperator: () => void;
}

export const InvertedOperatorButton = ({
    localConstraint,
    setInvertedOperator,
}: InvertedOperatorButtonProps) => (
    <Tooltip
        title={localConstraint.inverted ? 'Remove negation' : 'Negate operator'}
        arrow
    >
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
            <ConditionallyRender
                condition={Boolean(localConstraint.inverted)}
                show={
                    <StyledToggleButtonOn
                        className='operator-is-active'
                        onClick={setInvertedOperator}
                        disableRipple
                    >
                        <NegatedIcon />
                    </StyledToggleButtonOn>
                }
                elseShow={
                    <StyledToggleButtonOff
                        onClick={setInvertedOperator}
                        disableRipple
                    >
                        <NegatedIconOff />
                    </StyledToggleButtonOff>
                }
            />
        </Box>
    </Tooltip>
);
