import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useNavigate } from 'react-router-dom';
import UserForm from '../UserForm/UserForm.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useAdminUsersApi from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import useToast from 'hooks/useToast';
import useAddUserForm from '../hooks/useAddUserForm.ts';
import ConfirmUserAdded from '../ConfirmUserAdded/ConfirmUserAdded.tsx';
import { useState } from 'react';
import { scrollToTop } from 'component/common/util';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';
import { SeatCostWarning } from './SeatCostWarning/SeatCostWarning.tsx';
import useQueryParams from 'hooks/useQueryParams.ts';

const CreateUser = () => {
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const params = useQueryParams();
    const initialName = params.get('name') || '';
    const initialEmail = params.get('email') || '';
    const {
        name,
        setName,
        email,
        setEmail,
        sendEmail,
        setSendEmail,
        rootRole,
        setRootRole,
        getAddUserPayload,
        validateName,
        validateEmail,
        errors,
        clearErrors,
    } = useAddUserForm(initialName, initialEmail);
    const [showConfirm, setShowConfirm] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    const { addUser, userLoading: loading } = useAdminUsersApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = validateName();
        const validEmail = validateEmail();

        if (validName && validEmail) {
            const payload = getAddUserPayload();
            try {
                await addUser(payload)
                    .then((res) => res.json())
                    .then((user) => {
                        scrollToTop();
                        setInviteLink(user.inviteLink);
                        setShowConfirm(true);
                    });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };
    const closeConfirm = () => {
        setShowConfirm(false);
        navigate('/admin/users');
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/user-admin' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getAddUserPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title='Create Unleash user'
            description='In order for a user to get access to Unleash, they need to be assigned a root role, such as Viewer, Editor, or Admin.'
            documentationLink='https://docs.getunleash.io/concepts/rbac#predefined-roles'
            documentationLinkLabel='User management documentation'
            formatApiCode={formatApiCode}
        >
            <SeatCostWarning />
            <UserForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                sendEmail={sendEmail}
                setSendEmail={setSendEmail}
                rootRole={rootRole}
                setRootRole={setRootRole}
                clearErrors={clearErrors}
            >
                <CreateButton name='user' permission={ADMIN} />
            </UserForm>
            <ConfirmUserAdded
                open={showConfirm}
                closeConfirm={closeConfirm}
                emailSent={sendEmail}
                inviteLink={inviteLink}
            />
        </FormTemplate>
    );
};

export default CreateUser;
