import { Button, styled } from '@mui/material';
import { IConstraint } from 'interfaces/strategy';
import { CANCEL } from '../ConstraintAccordionEdit';

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

const StyledInputContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    width: '100%',
    padding: theme.spacing(2),
}));

const StyledInputButtonContainer = styled('div')({
    marginLeft: 'auto',
});

const StyledLeftButton = styled(Button)(({ theme }) => ({
    marginRight: theme.spacing(1),
    minWidth: '125px',
}));

const StyledRightButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    minWidth: '125px',
}));

export const ConstraintAccordionEditBody: React.FC<
    IConstraintAccordionBody
> = ({ localConstraint, children, triggerTransition, setAction, onSubmit }) => {
    return (
        <>
            <StyledInputContainer>
                <ConditionallyRender
                    condition={oneOf(newOperators, localConstraint.operator)}
                    show={<OperatorUpgradeAlert />}
                />
                {children}
            </StyledInputContainer>
            <StyledButtonContainer>
                <StyledInputButtonContainer>
                    <StyledLeftButton
                        type="button"
                        onClick={onSubmit}
                        variant="contained"
                        color="primary"
                        data-testid="CONSTRAINT_SAVE_BUTTON"
                    >
                        Save
                    </StyledLeftButton>
                    <StyledRightButton
                        onClick={() => {
                            setAction(CANCEL);
                            triggerTransition();
                        }}
                    >
                        Cancel
                    </StyledRightButton>
                </StyledInputButtonContainer>
            </StyledButtonContainer>
        </>
    );
};
