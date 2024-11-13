import { useEffect, useState } from 'react';

export const useTemplateForm = (initialName = '', initialDescription = '') => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    const validate = () => {
        if (name.length === 0) {
            setErrors((prev) => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        return true;
    };

    const clearErrors = () => {
        setErrors({});
    };

    const getTemplatePayload = () => {
        return {
            name,
            description,
        };
    };

    return {
        name,
        setName,
        description,
        setDescription,
        errors,
        clearErrors,
        validate,
        getTemplatePayload,
    };
};
