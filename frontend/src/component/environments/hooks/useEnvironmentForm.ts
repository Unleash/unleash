import { useEffect, useState } from 'react';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import { formatUnknownError } from 'utils/formatUnknownError';

const useEnvironmentForm = (
    initialName = '',
    initialType = 'development',
    initialRequiredApprovals: number | null = null,
) => {
    const [name, setName] = useState(initialName);
    const [type, setType] = useState(initialType);
    const [requiredApprovals, setRequiredApprovals] = useState(
        initialRequiredApprovals,
    );
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setType(initialType);
    }, [initialType]);

    useEffect(() => {
        setRequiredApprovals(initialRequiredApprovals);
    }, [initialRequiredApprovals]);

    const { validateEnvName } = useEnvironmentApi();

    const getEnvPayload = () => {
        return {
            name,
            type,
            ...(requiredApprovals ? { requiredApprovals } : {}),
        };
    };

    const validateEnvironmentName = async () => {
        if (name.length === 0) {
            setErrors((prev) => ({
                ...prev,
                name: 'Environment name can not be empty',
            }));
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
        type,
        setType,
        requiredApprovals,
        setRequiredApprovals,
        getEnvPayload,
        validateEnvironmentName,
        clearErrors,
        errors,
    };
};

export default useEnvironmentForm;
