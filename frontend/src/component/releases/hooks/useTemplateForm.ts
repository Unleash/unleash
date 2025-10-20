import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
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
        { id: crypto.randomUUID(), name: 'Milestone 1', sortOrder: 0 },
    ],
) => {
    const templateId = useOptionalPathParam('templateId');
    const { templates } = useReleasePlanTemplates();

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

        if (
            templates.some(
                (template) =>
                    template.name === name && template.id !== templateId,
            )
        ) {
            setErrors((prev) => ({
                ...prev,
                name: 'A template with this name already exists.',
            }));
            valid = false;
        }

        if (milestones.length === 0) {
            setErrors((prev) => ({
                ...prev,
                milestones: 'At least one milestone is required.',
            }));
            valid = false;
        }

        const errors: Record<string, string> = {};
        const nameSet = new Set();
        milestones.forEach((m) => {
            if (!m.name || m.name.length === 0) {
                errors[m.id] = 'Milestone must have a valid name.';
                errors[`${m.id}_name`] = 'Milestone must have a valid name.';
            }

            if (!m.strategies || m.strategies.length === 0) {
                errors[m.id] = 'Milestone must have at least one strategy.';
            }

            if (nameSet.has(m.name)) {
                errors[m.id] = 'Milestone names must be unique.';
            } else if (m.name) {
                nameSet.add(m.name);
            }
        });

        if (Object.keys(errors).length > 0) {
            setErrors((prev) => ({
                ...prev,
                ...errors,
                milestones:
                    'All milestones must have unique names and at least one strategy each.',
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
            milestones: milestones.map(
                ({ startExpanded, ...milestone }) => milestone,
            ),
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
