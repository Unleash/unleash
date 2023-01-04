import { IConstraint } from 'interfaces/strategy';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import React from 'react';
import { styled } from '@mui/material';

interface IConstraintOperatorProps {
    constraint: IConstraint;
    hasPrefix?: boolean;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    margin: 'auto 0',
}));

export const ConstraintOperator = ({
    constraint,
    hasPrefix,
}: IConstraintOperatorProps) => {
    const operatorName = constraint.operator;
    const operatorText = formatOperatorDescription(constraint.operator);

    return (
        <div
            className={styles.container}
            style={{
                borderTopLeftRadius: hasPrefix ? 0 : undefined,
                borderBottomLeftRadius: hasPrefix ? 0 : undefined,
                paddingLeft: hasPrefix ? 0 : undefined,
            }}
        >
            <div className={styles.name}>{operatorName}</div>
            <div className={styles.text}>{operatorText}</div>
        </div>
    );
};
