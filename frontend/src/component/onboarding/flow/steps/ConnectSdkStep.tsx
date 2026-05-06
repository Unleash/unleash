import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CodeBlockIcon from 'assets/icons/code-block.svg?react';
import {
    UPDATE_PROJECT,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import Add from '@mui/icons-material/Add';
import { StepLayout, type StepState } from './StepLayout.tsx';

interface IConnectSdkStepProps {
    projectId: string;
    setConnectSdkOpen: (open: boolean) => void;
    state: StepState;
}

export const ConnectSdkStep = ({
    projectId,
    setConnectSdkOpen,
    state,
}: IConnectSdkStepProps) => {
    const isDone = state === 'done';

    return (
        <StepLayout
            stepNumber={2}
            state={state}
            icon={<CodeBlockIcon />}
            title='Connect an SDK'
            body='To start using your feature flag, connect an SDK to the project.'
        >
            {isDone ? (
                <Button
                    variant='outlined'
                    color='inherit'
                    startIcon={<CheckIcon />}
                    disabled
                >
                    Done
                </Button>
            ) : (
                <ResponsiveButton
                    onClick={() => setConnectSdkOpen(true)}
                    maxWidth='200px'
                    projectId={projectId}
                    Icon={Add}
                    permission={[UPDATE_PROJECT, CREATE_PROJECT_API_TOKEN]}
                    disabled={state === 'disabled'}
                >
                    Connect SDK
                </ResponsiveButton>
            )}
        </StepLayout>
    );
};
