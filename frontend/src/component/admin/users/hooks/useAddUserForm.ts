import { useEffect, useState } from 'react';
import useUsers from '../../../../hooks/api/getters/useUsers/useUsers';

const useProjectRoleForm = (
    initialName = '',
    initialEmail = '',
    initialSendEmail = true,
    initialRootRole = 1
) => {
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [sendEmail, setSendEmail] = useState(initialSendEmail);
    const [rootRole, setRootRole] = useState(initialRootRole);
    const [errors, setErrors] = useState({});

    const { users } = useUsers();

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setEmail(initialEmail);
    }, [initialEmail]);

    useEffect(() => {
        setSendEmail(initialSendEmail);
    }, [initialSendEmail]);

    useEffect(() => {
        setRootRole(initialRootRole);
    }, [initialRootRole]);

    const getAddUserPayload = () => {
        return {
            name: name,
            email: email,
            sendEmail: sendEmail,
            rootRole: rootRole,
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

export default useProjectRoleForm;
