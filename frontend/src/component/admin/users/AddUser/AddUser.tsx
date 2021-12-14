import { useState } from 'react';
import Dialogue from '../../../common/Dialogue';

import { IUserApiErrors } from '../../../../hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import IRole from '../../../../interfaces/role';
import AddUserForm from './AddUserForm/AddUserForm';

interface IAddUserProps {
    showDialog: boolean;
    closeDialog: () => void;
    addUser: (data: any) => any;
    validatePassword: () => boolean;
    userLoading: boolean;
    userApiErrors: IUserApiErrors;
    roles: IRole[];
}

interface IAddUserFormData {
    name: string;
    email: string;
    rootRole: number;
    sendEmail: boolean;
}

const EDITOR_ROLE_ID = 2;

const initialData = { email: '', name: '', rootRole: EDITOR_ROLE_ID, sendEmail: true };

const AddUser = ({
    showDialog,
    closeDialog,
    userLoading,
    addUser,
    userApiErrors,
    roles,
}: IAddUserProps) => {
    const [data, setData] = useState<IAddUserFormData>(initialData);
    const [error, setError] = useState({});

    const submit = async (e: Event) => {
        e.preventDefault();
        if (!data.email) {
            setError({ general: 'You must specify the email address' });
            return;
        }

        if (!data.rootRole) {
            setError({ general: 'You must specify a role for the user' });
            return;
        }

        await addUser(data);
        setData(initialData);
        setError({});
    };

    const onCancel = (e: Event) => {
        e.preventDefault();
        setData(initialData);
        setError({});
        closeDialog();
    };

    const formId = 'add-user-dialog-form';

    return (
        <Dialogue
            onClick={e => {
                submit(e);
            }}
            formId={formId}
            open={showDialog}
            onClose={onCancel}
            primaryButtonText="Add user"
            secondaryButtonText="Cancel"
            title="Add team member"
            fullWidth
        >
            <AddUserForm
                formId={formId}
                userApiErrors={userApiErrors}
                data={data}
                setData={setData}
                roles={roles}
                submit={submit}
                error={error}
                userLoading={userLoading}
            />
        </Dialogue>
    );
};

export default AddUser;
