import { Button, FormControlLabel, Switch } from '@material-ui/core';
import { IConstraint } from '../../../../../interfaces/strategy';
import { CANCEL } from '../ConstraintAccordionEdit';

import { ConstraintFormHeader } from './ConstraintFormHeader/ConstraintFormHeader';
import { useStyles } from './ConstraintAccordionEditBody.styles';
import React from 'react';
import { newOperators } from 'constants/operators';
import ConditionallyRender from 'component/common/ConditionallyRender/ConditionallyRender';
import { oneOf } from 'utils/oneOf';
import { OperatorUpgradeAlert } from 'component/common/OperatorUpgradeAlert/OperatorUpgradeAlert';

interface IConstraintAccordionBody {
    localConstraint: IConstraint;
    setValues: (values: string[]) => void;
    triggerTransition: () => void;
    setValue: (value: string) => void;
    setAction: React.Dispatch<React.SetStateAction<string>>;
    setCaseInsensitive: () => void;
    setInvertedOperator: () => void;
    onSubmit: () => void;
}

export const ConstraintAccordionEditBody: React.FC<
    IConstraintAccordionBody
> = ({
    localConstraint,
    children,
    triggerTransition,
    setInvertedOperator,
    setAction,
    onSubmit,
}) => {
    const styles = useStyles();

    return (
        <>
            <ConditionallyRender
                condition={oneOf(newOperators, localConstraint.operator)}
                show={<OperatorUpgradeAlert />}
            />

            <div className={styles.inputContainer}>
                <InvertedOperator
                    inverted={Boolean(localConstraint.inverted)}
                    setInvertedOperator={setInvertedOperator}
                />
                {children}
            </div>
            <div className={styles.buttonContainer}>
                <div className={styles.innerButtonContainer}>
                    <Button
                        type="button"
                        onClick={onSubmit}
                        variant="contained"
                        color="primary"
                        className={styles.leftButton}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={() => {
                            setAction(CANCEL);
                            triggerTransition();
                        }}
                        className={styles.rightButton}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    );
};

interface IInvertedOperatorProps {
    inverted: boolean;
    setInvertedOperator: () => void;
}

const InvertedOperator = ({
    inverted,
    setInvertedOperator,
}: IInvertedOperatorProps) => {
    return (
        <>
            <ConstraintFormHeader>
                Should the operator be negated? (this will make the operator do
                the opposite)
            </ConstraintFormHeader>
            <FormControlLabel
                style={{ display: 'inline-block' }}
                control={
                    <Switch
                        checked={inverted}
                        onChange={() => setInvertedOperator()}
                        color="primary"
                    />
                }
                label={'negated'}
            />
        </>
    );
};
