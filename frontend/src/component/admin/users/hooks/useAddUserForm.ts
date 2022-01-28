import { useEffect, useState } from 'react';
import useUiBootstrap from '../../../../hooks/api/getters/useUiBootstrap/useUiBootstrap';
import useUsers from '../../../../hooks/api/getters/useUsers/useUsers';

const useCreateUserForm = (
    initialName = '',
    initialEmail = '',
    initialRootRole = 1
) => {
    const { bootstrap } = useUiBootstrap();
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [sendEmail, setSendEmail] = useState(false);
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
        setSendEmail(bootstrap?.email || false);
    }, [bootstrap?.email]);

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

export default useCreateUserForm;
