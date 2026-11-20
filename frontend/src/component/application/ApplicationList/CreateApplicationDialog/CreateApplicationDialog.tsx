import { useState } from 'react';
import { styled } from '@mui/material';
import { useNavigate } from 'react-router';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import useApplicationsApi from 'hooks/api/actions/useApplicationsApi/useApplicationsApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { Tracking } from 'utils/trackingEvents';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const createApplicationTracking: Tracking = {
    event: 'applications',
    type: 'create-application',
};

interface ICreateApplicationDialogProps {
    onClose: () => void;
}

const formId = 'create-application-form';
const appNamePattern = /^[A-Za-z0-9][A-Za-z0-9._~-]*$/;
const maxLength = 255;

export const CreateApplicationDialog = ({
    onClose,
}: ICreateApplicationDialogProps) => {
    const navigate = useNavigate();
    const { createApplication } = useApplicationsApi();
    const [appName, setAppName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string>();

    const validName = appNamePattern.test(appName);
    const nameError =
        appName && !validName
            ? 'Use letters, numbers, ".", "_", "~" or "-", starting with a letter or number.'
            : error;

    const onSubmit = async () => {
        await createApplication({
            appName,
            description: description || undefined,
        });
        navigate(`/applications/${encodeURIComponent(appName)}`);
    };

    return (
        <Dialogue
            open
            title='Create application'
            primaryButtonText='Create application'
            secondaryButtonText='Cancel'
            onSubmit={onSubmit}
            onError={(error) => setError(formatUnknownError(error))}
            tracking={createApplicationTracking}
            onClose={onClose}
            disabledPrimaryButton={!validName}
            formId={formId}
        >
            <StyledForm
                id={formId}
                onSubmit={(event) => event.preventDefault()}
            >
                <Input
                    label='Name'
                    description='The app name your SDK is configured with. It cannot be changed later.'
                    value={appName}
                    onChange={(event) => {
                        setAppName(event.target.value);
                        setError(undefined);
                    }}
                    error={Boolean(nameError)}
                    errorText={nameError}
                    slotProps={{ htmlInput: { maxLength } }}
                    fullWidth
                    autoFocus
                />
                <Input
                    label='Description (optional)'
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    slotProps={{ htmlInput: { maxLength } }}
                    fullWidth
                />
            </StyledForm>
        </Dialogue>
    );
};
