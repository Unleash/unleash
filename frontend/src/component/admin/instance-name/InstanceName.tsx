import { useState, type FormEvent } from 'react';
import { Button, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useInstanceStatusApi from 'hooks/api/actions/useInstanceStatusApi/useInstanceStatusApi';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { validateInstanceName } from './validateInstanceName.js';

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
    maxWidth: theme.spacing(60),
}));

export const InstanceName = () => (
    <PermissionGuard permissions={[ADMIN]}>
        <InstanceNamePage />
    </PermissionGuard>
);

const InstanceNamePage = () => {
    const { instanceStatus, loading, refetchInstanceStatus } =
        useInstanceStatus();

    return (
        <PageContent
            header={<PageHeader title='Instance name' />}
            isLoading={loading}
        >
            {!loading && (
                <InstanceNameForm
                    initialName={instanceStatus?.name ?? ''}
                    onSaved={refetchInstanceStatus}
                />
            )}
        </PageContent>
    );
};

const InstanceNameForm = ({
    initialName,
    onSaved,
}: {
    initialName: string;
    onSaved: () => void;
}) => {
    const [name, setName] = useState(initialName);
    const { setInstanceName, loading } = useInstanceStatusApi();
    const { setToastData, setToastApiError } = useToast();
    const errorText = validateInstanceName(name);
    const canSubmit =
        name.trim().length > 0 && errorText === undefined && !loading;

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await setInstanceName(name.trim());
            onSaved();
            setToastData({
                type: 'success',
                text: 'Instance name updated',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <StyledForm onSubmit={onSubmit}>
            <p>
                The instance name is displayed to users when they log into
                Unleash. You can change your instance name by editing it below.
            </p>
            <Input
                label='Name'
                value={name}
                placeholder='My instance name'
                onChange={(event) => setName(event.target.value)}
                error={errorText !== undefined}
                errorText={errorText}
                fullWidth
            />
            <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={!canSubmit}
            >
                Save
            </Button>
        </StyledForm>
    );
};
