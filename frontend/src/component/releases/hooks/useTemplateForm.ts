import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { useEffect, useState } from 'react';

export const useTemplateForm = (
    initialName = '',
    initialDescription = '',
    initialMilestones: IReleasePlanMilestonePayload[] = [
        { name: 'Milestone 1', sortOrder: 0 },
    ],
) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [milestones, setMilestones] = useState(initialMilestones);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    useEffect(() => {
        setMilestones(initialMilestones);
    }, [initialMilestones.length]);

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
        milestones,
        setMilestones,
        errors,
        clearErrors,
        validate,
        getTemplatePayload,
    };
};
