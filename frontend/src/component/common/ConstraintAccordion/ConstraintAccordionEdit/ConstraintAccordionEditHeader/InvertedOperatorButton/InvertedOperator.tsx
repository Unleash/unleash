import { Button, IconButton, Tooltip } from '@mui/material';
import { ReactComponent as NegatedIcon } from '../../../../../../assets/icons/24_Negator.svg';
import { ReactComponent as NegatedIconOff } from '../../../../../../assets/icons/24_Negator off.svg';
import React, { useMemo } from 'react';
import { IConstraint } from '../../../../../../interfaces/strategy';

interface InvertedOperatorProps {
    localConstraint: IConstraint;
    setInvertedOperator: () => void;
    className: any;
}

export const InvertedOperator = ({
    localConstraint,
    setInvertedOperator,
    className
}: InvertedOperatorProps) => {
    const icon = useMemo(() => {
        return localConstraint.inverted ? (
            <NegatedIcon fill='white' stroke='white'/>
        ) : (
            <NegatedIconOff fill='white' stroke='white'/>
        );
    }, [localConstraint]);

    return (
        <Tooltip
            title={
                localConstraint.inverted ? 'Remove negation' : 'Negate operator'
            }
            arrow
        >
            <Button
                variant="contained"
                onClick={setInvertedOperator}
                disableRipple
                className={className}
            >
                {icon}
            </Button>
        </Tooltip>
    );
};
