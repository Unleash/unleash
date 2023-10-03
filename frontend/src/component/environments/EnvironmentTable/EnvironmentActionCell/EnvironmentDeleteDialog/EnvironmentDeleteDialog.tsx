import { styled, Alert } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IEnvironment } from 'interfaces/environments';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { EnvironmentTableSingle } from 'component/environments/EnvironmentTable/EnvironmentTableSingle';

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
}));

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

interface IEnvironmentDeleteDialogProps {
    environment: IEnvironment;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const EnvironmentDeleteDialog = ({
    environment,
    open,
    setOpen,
    onConfirm,
}: IEnvironmentDeleteDialogProps) => {
    const [confirmName, setConfirmName] = useState('');

    useEffect(() => {
        setConfirmName('');
    }, [open]);

    return (
        <Dialogue
            title="Delete environment?"
            open={open}
            primaryButtonText="Delete environment"
            disabledPrimaryButton={environment.name !== confirmName}
            secondaryButtonText="Close"
            onClick={onConfirm}
            onClose={() => {
                setOpen(false);
            }}
        >
            <Alert severity="error">
                <strong>
                    Danger! This action is not reversible. Please proceed with
                    caution.
                </strong>{' '}
                Deleting this environment will result in removing all strategies
                that are active in this environment across all feature toggles.
            </Alert>

            <EnvironmentTableSingle
                environment={environment}
                warnEnabledToggles
            />

            <StyledLabel>
                In order to delete this environment, please enter the id of the
                environment in the textfield below:{' '}
                <strong>{environment.name}</strong>
            </StyledLabel>
            <StyledInput
                label="Environment name"
                value={confirmName}
                onChange={e => setConfirmName(e.target.value)}
            />
        </Dialogue>
    );
};
