import { Box, Tooltip } from '@mui/material';
import { ReactComponent as NegatedOnIcon } from 'assets/icons/not_operator_selected.svg';
import { ReactComponent as NegatedOffIcon } from 'assets/icons/not_operator_unselected.svg';
import type { IConstraint } from 'interfaces/strategy';
import {
    StyledToggleButtonOff,
    StyledToggleButtonOn,
} from '../StyledToggleButton.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender.tsx';

interface InvertedOperatorButtonProps {
    localConstraint: Pick<IConstraint, 'inverted'>;
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
                        <NegatedOnIcon />
                    </StyledToggleButtonOn>
                }
                elseShow={
                    <StyledToggleButtonOff
                        onClick={setInvertedOperator}
                        disableRipple
                    >
                        <NegatedOffIcon />
                    </StyledToggleButtonOff>
                }
            />
        </Box>
    </Tooltip>
);
