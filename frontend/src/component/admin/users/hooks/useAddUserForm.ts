import { useEffect, useState } from 'react';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IRole } from 'interfaces/role';

const useCreateUserForm = (
    initialName = '',
    initialEmail = '',
    initialRootRole = null
) => {
    const { uiConfig } = useUiConfig();
    const { users, roles } = useUsers();
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [sendEmail, setSendEmail] = useState(false);
    const [rootRole, setRootRole] = useState<IRole | null>(
        roles.find(({ id }) => id === initialRootRole) || null
    );
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setEmail(initialEmail);
    }, [initialEmail]);

    useEffect(() => {
        setSendEmail(uiConfig?.emailEnabled || false);
    }, [uiConfig?.emailEnabled]);

    useEffect(() => {
        setRootRole(roles.find(({ id }) => id === initialRootRole) || null);
    }, [initialRootRole]);

    const getAddUserPayload = () => {
        return {
            name: name,
            email: email,
            sendEmail: sendEmail,
            rootRole: rootRole?.id || 0,
        };
    };

    const validateName = () => {
        if (name.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        if (email.length === 0) {
            setErrors(prev => ({ ...prev, email: 'Email can not be empty.' }));
            return false;
        }
        return true;
    };

    const validateEmail = () => {
        if (users.some(user => user['email'] === email)) {
            setErrors(prev => ({ ...prev, email: 'Email already exists' }));
            return false;
        }
        return true;
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
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
        clearErrors,
        errors,
    };
};

export default useCreateUserForm;
