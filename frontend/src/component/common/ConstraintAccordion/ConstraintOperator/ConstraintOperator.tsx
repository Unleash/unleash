import { IConstraint } from 'interfaces/strategy';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { useStyles } from 'component/common/ConstraintAccordion/ConstraintOperator/ConstraintOperator.styles';
import React from 'react';

interface IConstraintOperatorProps {
    constraint: IConstraint;
}

export const ConstraintOperator = ({
    constraint,
}: IConstraintOperatorProps) => {
    const { classes: styles } = useStyles();

    const operatorName = constraint.operator;
    const operatorText = formatOperatorDescription(constraint.operator);

    return (
        <div className={styles.container}>
            <div className={styles.name}>{operatorName}</div>
            <div className={styles.text}>{operatorText}</div>
        </div>
    );
};
