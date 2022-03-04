import { Button, Chip, makeStyles } from '@material-ui/core';
import Input from 'component/common/Input/Input';
import React, { useState } from 'react';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';

interface IFreeTextInputProps {
    values: string[];
    removeValue: (index: number) => void;
    setValues: (values: string[]) => void;
    beforeValues?: JSX.Element;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles(theme => ({
    valueChip: { margin: '0 0.5rem 0.5rem 0' },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down(700)]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    },
    inputInnerContainer: {
        minWidth: '300px',
        [theme.breakpoints.down(700)]: {
            minWidth: '100%',
        },
    },
    input: {
        width: '100%',
        margin: '1rem 0',
    },
    button: {
        marginLeft: '1rem',
        [theme.breakpoints.down(700)]: {
            marginLeft: 0,
            marginBottom: '0.5rem',
        },
    },
    valuesContainer: { marginTop: '1rem' },
}));

export const FreeTextInput = ({
    values,
    removeValue,
    setValues,
    error,
    setError,
}: IFreeTextInputProps) => {
    const [inputValues, setInputValues] = useState('');
    const styles = useStyles();

    const addValues = () => {
        if (inputValues.length === 0) {
            setError('values can not be empty');
            return;
        }
        setError('');

        if (inputValues.includes(',')) {
            const newValues = inputValues
                .split(',')
                .filter(values => values)
                .map(value => value.trim());
            setValues([...values, ...newValues]);
        } else {
            setValues([...values, inputValues.trim()]);
        }

        setInputValues('');
    };

    return (
        <div>
            <ConstraintFormHeader style={{ marginBottom: 0 }}>
                Set values (maximum 100)
            </ConstraintFormHeader>
            <div className={styles.inputContainer}>
                <div className={styles.inputInnerContainer}>
                    <Input
                        label="Values"
                        name="values"
                        value={inputValues}
                        onFocus={() => {
                            setError('');
                        }}
                        onChange={e => setInputValues(e.target.value)}
                        placeholder="value1, value2, value3..."
                        className={styles.input}
                        error={Boolean(error)}
                        errorText={error}
                    />
                </div>
                <Button
                    className={styles.button}
                    variant="contained"
                    color="primary"
                    onClick={() => addValues()}
                >
                    Add values
                </Button>
            </div>
            <div className={styles.valuesContainer}>
                <ConstraintValueChips
                    values={values}
                    removeValue={removeValue}
                />
            </div>
        </div>
    );
};

interface IConstraintValueChipsProps {
    values: string[];
    removeValue: (index: number) => void;
}

const ConstraintValueChips = ({
    values,
    removeValue,
}: IConstraintValueChipsProps) => {
    const styles = useStyles();
    return (
        <>
            {values.map((value, index) => {
                // Key is not ideal, but we don't have anything guaranteed to
                // be unique here.
                return (
                    <Chip
                        label={value}
                        key={`${value}-${index}`}
                        onDelete={() => removeValue(index)}
                        className={styles.valueChip}
                    />
                );
            })}
        </>
    );
};
