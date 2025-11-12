import type { IReleasePlan } from 'interfaces/releasePlans';
import { useReleasePlanTemplate } from './api/getters/useReleasePlanTemplates/useReleasePlanTemplate.js';

export const useReleasePlanPreview = (
    templateId: string,
    featureName: string,
    environment: string,
): IReleasePlan => {
    const { template } = useReleasePlanTemplate(templateId);

    return {
        ...template,
        featureName,
        environment,
        safeguards: [],
        milestones: template.milestones.map((milestone) => ({
            ...milestone,
            releasePlanDefinitionId: template.id,
            strategies: (milestone.strategies || []).map((strategy) => ({
                ...strategy,
                parameters: {
                    ...strategy.parameters,
                    ...(strategy.parameters.groupId && {
                        groupId: String(strategy.parameters.groupId).replaceAll(
                            '{{featureName}}',
                            featureName,
                        ),
                    }),
                },
                milestoneId: milestone.id,
            })),
        })),
    };
};
