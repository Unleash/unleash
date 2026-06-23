import { styled, Alert } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { IProjectEnvironment } from 'interfaces/environments';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { FormField } from 'component/common/FormField/FormField';
import { ProjectEnvironmentTableSingle } from './ProjectEnvironmentTableSingle/ProjectEnvironmentTableSingle.tsx';

const StyledFieldContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
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

            <StyledFieldContainer>
                <FormField
                    label='Environment name'
                    description={
                        <>
                            In order to hide this environment, please enter the
                            id of the environment in the textfield below:{' '}
                            <strong>{environment?.name}</strong>
                        </>
                    }
                >
                    <StyledInput
                        label=''
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                    />
                </FormField>
            </StyledFieldContainer>
        </Dialogue>
    );
};
