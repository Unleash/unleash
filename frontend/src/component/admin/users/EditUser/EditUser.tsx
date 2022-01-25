import FormTemplate from '../../../common/FormTemplate/FormTemplate';
import { useHistory, useParams } from 'react-router-dom';
import UserForm from '../UserForm/UserForm';
import useAddUserForm from '../hooks/useAddUserForm';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../../hooks/useToast';
import useAdminUsersApi from '../../../../hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import useUserInfo from '../../../../hooks/api/getters/useUserInfo/useUserInfo';
import { scrollToTop } from '../../../common/util';
import { useEffect } from 'react';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { ADMIN } from '../../../providers/AccessProvider/permissions';
import { EDIT } from '../../../../constants/misc';

const EditUser = () => {
    useEffect(() => {
        scrollToTop();
    }, []);
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const { id } = useParams<{ id: string }>();
    const { user, refetch } = useUserInfo(id);
    const { updateUser, userLoading: loading } = useAdminUsersApi();
    const history = useHistory();
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
        errors,
        clearErrors,
    } = useAddUserForm(
        user?.name,
        user?.email,
        user?.sendEmail,
        user?.rootRole
    );

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/user-admin/${id}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getAddUserPayload(), undefined, 2)}'`;
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const payload = getAddUserPayload();
        const validName = validateName();

        if (validName) {
            try {
                await updateUser({ ...payload, id });
                refetch();
                history.push('/admin/users');
                setToastData({
                    title: 'User information updated',
                    type: 'success',
                });
            } catch (e: any) {
                setToastApiError(e.toString());
            }
        }
    };

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit user"
            description="In order to get access to Unleash needs to have an Unleash root role as Admin, Editor or Viewer.
            You can also add the user to projects as member or owner in the specific projects."
            documentationLink="https://docs.getunleash.io/user_guide/user-management"
            formatApiCode={formatApiCode}
        >
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
                mode={EDIT}
            >
                <PermissionButton
                    permission={ADMIN}
                    type="submit"
                >
                    Edit user
                </PermissionButton>
            </UserForm>
        </FormTemplate>
    );
};

export default EditUser;
