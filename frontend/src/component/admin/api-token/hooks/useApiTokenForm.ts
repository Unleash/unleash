import { useEffect, useState } from 'react';

const useApiToken = (
    initialUserName = '',
    initialtype = 'CLIENT',
    initialProject = '*',
    initialEnvironment = 'default'
) => {
    const [username, setUsername] = useState(initialUserName);
    const [type, setType] = useState(initialtype);
    const [project, setProject] = useState(initialtype);
    const [environment, setEnvironment] = useState(initialEnvironment);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setUsername(initialUserName);
    }, [initialUserName]);

    useEffect(() => {
        setType(initialtype);
        if (type === 'ADMIN') {
            setProject('*');
            setEnvironment('*')
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialtype]);

    useEffect(() => {
        setProject(initialProject);
    }, [initialProject]);

    useEffect(() => {
        setEnvironment(initialEnvironment);
    }, [initialEnvironment]);

    const setTokenType = (value: string) => {
        if (value === 'ADMIN') {
            setType(value)
            setProject('*');
            setEnvironment('*');
        } else {
            setType(value)
            setEnvironment(initialEnvironment);
        }
    };

    const getApiTokenPayload = () => {
        return {
            username: username,
            type: type,
            project: project,
            environment: environment,
        };
    };

    const isValid = () => {
        if (!username) {
            setErrors({ username: 'Username is required.' });
            return false;
        } else {
            setErrors({});
            return true;
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        username,
        type,
        project,
        environment,
        setUsername,
        setTokenType,
        setProject,
        setEnvironment,
        getApiTokenPayload,
        isValid,
        clearErrors,
        errors,
    };
};

export default useApiToken;
