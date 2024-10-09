import type { RunnableToolFunctionWithParse } from 'openai/lib/RunnableFunction';
import type { IAuditUser, IUser } from '../../../types';
import type FeatureToggleService from '../../feature-toggle/feature-toggle-service';

type toggleFlagOperationalParams = {
    featureService: FeatureToggleService;
    auditUser: IAuditUser;
    user: IUser;
};

type toggleFlagParams = {
    project: string;
    name: string;
    environment: string;
    enabled: boolean;
};

type toggleFlagFunctionParams = toggleFlagOperationalParams & toggleFlagParams;

const toggleFlagFunction = async ({
    featureService,
    auditUser,
    user,
    project,
    name,
    environment,
    enabled,
}: toggleFlagFunctionParams) => {
    try {
        const response = await featureService.updateEnabled(
            project,
            name,
            environment,
            enabled,
            auditUser,
            user,
            false,
        );

        return response;
    } catch (error) {
        return error;
    }
};

export const toggleFlag = ({
    featureService,
    auditUser,
    user,
}: toggleFlagOperationalParams): RunnableToolFunctionWithParse<toggleFlagParams> => ({
    type: 'function',
    function: {
        function: (params: toggleFlagParams) =>
            toggleFlagFunction({ ...params, featureService, auditUser, user }),
        name: 'toggleFlag',
        description:
            'Toggle a feature flag by name, project, environment, and enabled status',
        parse: JSON.parse,
        parameters: {
            type: 'object',
            properties: {
                project: {
                    type: 'string',
                    description: 'The project the flag belongs to.',
                },
                name: { type: 'string', description: 'The name of the flag.' },
                environment: {
                    type: 'string',
                    description: 'The environment in which to toggle the flag',
                },
                enabled: {
                    type: 'boolean',
                    description: 'The desired enabled status of the flag',
                },
            },
            required: ['project', 'name', 'environment', 'enabled'],
        },
    },
});
