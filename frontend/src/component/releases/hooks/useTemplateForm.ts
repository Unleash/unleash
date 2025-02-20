import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useTemplateForm = (
    initialName = '',
    initialDescription = '',
    initialMilestones: IReleasePlanMilestonePayload[] = [
        { id: uuidv4(), name: 'Milestone 1', sortOrder: 0 },
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
        let valid = true;

        if (name.length === 0) {
            setErrors((prev) => ({ ...prev, name: 'Name can not be empty.' }));
            valid = false;
        }

        if (milestones.length === 0) {
            setErrors((prev) => ({
                ...prev,
                milestones: 'At least one milestone is required.',
            }));
            valid = false;
        }

        const milestoneNames = milestones.filter(
            (m) => !m.name || m.name.length === 0,
        );
        if (milestoneNames && milestoneNames.length > 0) {
            setErrors((prev) => ({
                ...prev,
                ...Object.assign(
                    {},
                    ...milestoneNames.map((mst) => ({
                        [mst.id]: 'Milestone must have a valid name.',
                    })),
                ),
                ...Object.assign(
                    {},
                    ...milestoneNames.map((mst) => ({
                        [`${mst.id}_name`]: 'Milestone must have a valid name.',
                    })),
                ),
            }));
            valid = false;
        }

        const emptyMilestones = milestones.filter(
            (m) => !m.strategies || m.strategies.length === 0,
        );
        if (emptyMilestones && emptyMilestones.length > 0) {
            setErrors((prev) => ({
                ...prev,
                milestones:
                    'All milestones must have at least one strategy each.',
                ...Object.assign(
                    {},
                    ...emptyMilestones.map((mst) => ({
                        [mst.id]: 'Milestone must have at least one strategy.',
                    })),
                ),
            }));
            valid = false;
        }

        return valid;
    };

    const clearErrors = () => {
        setErrors({});
    };

    const getTemplatePayload = () => {
        return {
            name,
            description,
            milestones: milestones.map((milestone) => {
                return {
                    ...milestone,
                    new: undefined,
                };
            }),
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
