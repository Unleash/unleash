import { styled, Alert } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { IProjectEnvironment } from 'interfaces/environments';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { ProjectEnvironmentTableSingle } from './ProjectEnvironmentTableSingle/ProjectEnvironmentTableSingle.tsx';

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
}));

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

interface IEnvironmentHideDialogProps {
    environment?: IProjectEnvironment;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const EnvironmentHideDialog = ({
    environment,
    open,
    setOpen,
    onConfirm,
}: IEnvironmentHideDialogProps) => {
    const [confirmName, setConfirmName] = useState('');

    useEffect(() => {
        setConfirmName('');
    }, [open]);

    return (
        <Dialogue
            title='Hide environment and disable feature flags?'
            open={open}
            primaryButtonText='Hide environment and disable feature flags'
            disabledPrimaryButton={environment?.name !== confirmName}
            secondaryButtonText='Close'
            onClick={onConfirm}
            onClose={() => {
                setOpen(false);
            }}
        >
            <Alert severity='error'>
                <strong>Danger!</strong> Hiding an environment will disable all
                the feature flags that are enabled in this environment and it
                can impact client applications connected to the environment.
            </Alert>

            <ProjectEnvironmentTableSingle environment={environment!} />

            <StyledLabel>
                In order to hide this environment, please enter the id of the
                environment in the textfield below:{' '}
                <strong>{environment?.name}</strong>
            </StyledLabel>
            <StyledInput
                label='Environment name'
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
            />
        </Dialogue>
    );
};
