import { useState, type FormEvent } from 'react';
import { Button, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
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
    const [name, setName] = useState('');
    const errorText = validateInstanceName(name);
    const canSubmit = name.trim().length > 0 && errorText === undefined;

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO: wire to instance-name API when backend is ready.
    };

    return (
        <PageContent header={<PageHeader title='Instance name' />}>
            <StyledForm onSubmit={onSubmit}>
                <p>
                    The instance name is displayed to users when they log into
                    Unleash. You can change your instance name by editing it
                    below.
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
        </PageContent>
    );
};
