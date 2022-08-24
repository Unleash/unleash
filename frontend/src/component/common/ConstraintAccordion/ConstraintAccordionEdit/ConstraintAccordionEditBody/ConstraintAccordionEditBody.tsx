import { Button } from '@mui/material';
import { IConstraint } from 'interfaces/strategy';
import { CANCEL } from '../ConstraintAccordionEdit';

import { useStyles } from './ConstraintAccordionEditBody.styles';
import React from 'react';
import { newOperators } from 'constants/operators';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { oneOf } from 'utils/oneOf';
import { OperatorUpgradeAlert } from 'component/common/OperatorUpgradeAlert/OperatorUpgradeAlert';

interface IConstraintAccordionBody {
    localConstraint: IConstraint;
    setValues: (values: string[]) => void;
    triggerTransition: () => void;
    setValue: (value: string) => void;
    setAction: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: () => void;
}

export const ConstraintAccordionEditBody: React.FC<
    IConstraintAccordionBody
> = ({ localConstraint, children, triggerTransition, setAction, onSubmit }) => {
    const { classes: styles } = useStyles();

    return (
        <>
            <div className={styles.inputContainer}>
                <ConditionallyRender
                    condition={oneOf(newOperators, localConstraint.operator)}
                    show={<OperatorUpgradeAlert />}
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
