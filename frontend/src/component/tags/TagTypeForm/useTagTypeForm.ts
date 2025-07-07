import { useEffect, useState } from 'react';
import useTagTypesApi from 'hooks/api/actions/useTagTypesApi/useTagTypesApi';
import { formatUnknownError } from 'utils/formatUnknownError';

interface TagTypePayload {
    name: string;
    description: string;
    color?: string;
}

const useTagTypeForm = (
    initialTagName = '',
    initialTagDesc = '',
    initialColor = '#FFFFFF',
) => {
    const [tagName, setTagName] = useState(initialTagName);
    const [tagDesc, setTagDesc] = useState(initialTagDesc);
    const [color, setColor] = useState(initialColor);
    const [errors, setErrors] = useState({});
    const { validateTagName } = useTagTypesApi();

    useEffect(() => {
        setTagName(initialTagName);
    }, [initialTagName]);

    useEffect(() => {
        setTagDesc(initialTagDesc);
    }, [initialTagDesc]);

    useEffect(() => {
        setColor(initialColor);
    }, [initialColor]);

    const getTagPayload = () => {
        const payload: TagTypePayload = {
            name: tagName,
            description: tagDesc,
            color: color,
        };

        return payload;
    };

    const validateNameUniqueness = async () => {
        if (tagName.length === 0) {
            setErrors((prev) => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        if (tagName.length < 2) {
            setErrors((prev) => ({
                ...prev,
                name: 'Tag name length must be at least 2 characters long',
            }));
            return false;
        }
        try {
            await validateTagName(tagName);
            return true;
        } catch (err: unknown) {
            setErrors((prev) => ({
                ...prev,
                name: formatUnknownError(err),
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
        color,
        setTagName,
        setTagDesc,
        setColor,
        getTagPayload,
        clearErrors,
        validateNameUniqueness,
        errors,
    };
};

export default useTagTypeForm;
