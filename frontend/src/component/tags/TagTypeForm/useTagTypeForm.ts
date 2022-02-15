import { useEffect, useState } from 'react';
import useTagTypesApi from '../../../hooks/api/actions/useTagTypesApi/useTagTypesApi';
import { formatUnknownError } from '../../../utils/format-unknown-error';

const useTagTypeForm = (initialTagName = '', initialTagDesc = '') => {
    const [tagName, setTagName] = useState(initialTagName);
    const [tagDesc, setTagDesc] = useState(initialTagDesc);
    const [errors, setErrors] = useState({});
    const { validateTagName } = useTagTypesApi();

    useEffect(() => {
        setTagName(initialTagName);
    }, [initialTagName]);

    useEffect(() => {
        setTagDesc(initialTagDesc);
    }, [initialTagDesc]);

    const getTagPayload = () => {
        return {
            name: tagName,
            description: tagDesc,
        };
    };

    const validateNameUniqueness = async () => {
        if (tagName.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        if (tagName.length < 2) {
            setErrors(prev => ({
                ...prev,
                name: 'Tag name length must be at least 2 characters long',
            }));
            return false;
        }
        try {
            await validateTagName(tagName);
            return true;
        } catch (err: unknown) {
            setErrors(prev => ({
                ...prev,
                name: formatUnknownError(err)
            }));
            return false;
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        tagName,
        tagDesc,
        setTagName,
        setTagDesc,
        getTagPayload,
        clearErrors,
        validateNameUniqueness,
        errors,
    };
};

export default useTagTypeForm;
