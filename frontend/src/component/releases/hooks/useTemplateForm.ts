import { createUuid } from 'utils/createUuid';
import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { useEffect, useState } from 'react';

export interface IExtendedMilestonePayload
    extends IReleasePlanMilestonePayload {
    startExpanded?: boolean;
}

export const useTemplateForm = (
    initialName = '',
    initialDescription = '',
    initialMilestones: IExtendedMilestonePayload[] = [
        { id: createUuid(), name: 'Milestone 1', sortOrder: 0 },
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

    const validate = (): Record<string, string> => {
        const validationErrors: Record<string, string> = {};

        if (name.length === 0) {
            validationErrors.name = 'Name can not be empty.';
        }

        if (milestones.length === 0) {
            validationErrors.milestones = 'At least one milestone is required.';
        }

        const milestoneErrors: Record<string, string> = {};
        const nameSet = new Set();
        milestones.forEach((m) => {
            if (!m.name || m.name.length === 0) {
                milestoneErrors[m.id] = 'Milestone must have a valid name.';
                milestoneErrors[`${m.id}_name`] =
                    'Milestone must have a valid name.';
            }

            if (!m.strategies || m.strategies.length === 0) {
                milestoneErrors[m.id] =
                    'Milestone must have at least one strategy.';
            }

            if (nameSet.has(m.name)) {
                milestoneErrors[m.id] = 'Milestone names must be unique.';
            } else if (m.name) {
                nameSet.add(m.name);
            }
        });

        if (Object.keys(milestoneErrors).length > 0) {
            Object.assign(validationErrors, milestoneErrors);
            validationErrors.milestones =
                'All milestones must have unique names and at least one strategy each.';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...validationErrors }));
        }

        return validationErrors;
    };

    const clearErrors = () => {
        setErrors({});
    };

    const getTemplatePayload = () => {
        return {
            name,
            description,
            milestones: milestones.map(({ startExpanded, ...milestone }) => ({
                ...milestone,
                strategies: milestone.strategies?.map(
                    ({ strategyName, name, ...strategy }) => {
                        const normalizedName = name || strategyName || ''; // todo(v9) remove the normalization; use `name` directly
                        return {
                            name: normalizedName, // place name first in the object for legibility
                            ...strategy,
                        };
                    },
                ),
            })),
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
        setErrors,
        clearErrors,
        validate,
        getTemplatePayload,
    };
};
