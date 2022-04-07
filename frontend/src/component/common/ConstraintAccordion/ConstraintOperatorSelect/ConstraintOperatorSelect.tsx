import { Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import {
    Operator,
    stringOperators,
    semVerOperators,
    dateOperators,
    numOperators,
} from 'constants/operators';
import React, { useState, ChangeEvent } from 'react';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { useStyles } from 'component/common/ConstraintAccordion/ConstraintOperatorSelect/ConstraintOperatorSelect.styles';
import classNames from 'classnames';

interface IConstraintOperatorSelectProps {
    options: Operator[];
    value: Operator;
    onChange: (value: Operator) => void;
}

export const ConstraintOperatorSelect = ({
    options,
    value,
    onChange,
}: IConstraintOperatorSelectProps) => {
    const styles = useStyles();
    const [open, setOpen] = useState(false);

    const onSelectChange = (
        event: ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        onChange(event.target.value as Operator);
    };

    const renderValue = () => {
        return (
            <div className={styles.valueContainer}>
                <div className={styles.label}>{value}</div>
                <div className={styles.description}>
                    {formatOperatorDescription(value)}
                </div>
            </div>
        );
    };

    return (
        <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel htmlFor="operator-select">Operator</InputLabel>
            <Select
                id="operator-select"
                name="operator"
                label="Operator"
                value={value}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onChange={onSelectChange}
                renderValue={renderValue}
            >
                {options.map(operator => (
                    <MenuItem
                        key={operator}
                        value={operator}
                        className={classNames(
                            needSeparatorAbove(operator) && styles.separator
                        )}
                    >
                        <div className={styles.optionContainer}>
                            <div className={styles.label}>{operator}</div>
                            <div className={styles.description}>
                                {formatOperatorDescription(operator)}
                            </div>
                        </div>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

const needSeparatorAbove = (operator: Operator): boolean => {
    const groups = [
        stringOperators,
        numOperators,
        dateOperators,
        semVerOperators,
    ];

    return groups.some(group => {
        return group[0] === operator;
    });
};
