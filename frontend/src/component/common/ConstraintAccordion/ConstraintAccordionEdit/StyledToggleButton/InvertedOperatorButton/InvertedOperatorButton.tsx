import { Tooltip } from '@mui/material';
import { ReactComponent as NegatedIcon } from '../../../../../../assets/icons/24_Negator.svg';
import { ReactComponent as NegatedIconOff } from '../../../../../../assets/icons/24_Negator off.svg';
import React from 'react';
import { IConstraint } from '../../../../../../interfaces/strategy';
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
}: InvertedOperatorButtonProps) => {
    return (
        <ConditionallyRender
            condition={Boolean(localConstraint.inverted)}
            show={
                <Tooltip title="Remove negation" arrow>
                    <StyledToggleButtonOn
                        onClick={setInvertedOperator}
                        disableRipple
                    >
                        <NegatedIcon />
                    </StyledToggleButtonOn>
                </Tooltip>
            }
            elseShow={
                <Tooltip title="Negate operator" arrow>
                    <StyledToggleButtonOff
                        onClick={setInvertedOperator}
                        disableRipple
                    >
                        <NegatedIconOff />
                    </StyledToggleButtonOff>
                </Tooltip>
            }
        />
    );
};
