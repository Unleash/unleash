import type { RunnableToolFunctionWithParse } from 'openai/lib/RunnableFunction';
import type { IAuditUser } from '../../../types';
import type FeatureToggleService from '../../feature-toggle/feature-toggle-service';

type createFlagOperationalParams = {
    featureService: FeatureToggleService;
    auditUser: IAuditUser;
};

type createFlagParams = {
    project: string;
    name: string;
    description?: string;
};

type createFlagFunctionParams = createFlagOperationalParams & createFlagParams;

const createFlagFunction = async ({
    featureService,
    auditUser,
    project,
    name,
    description,
}: createFlagFunctionParams) => {
    try {
        const response = await featureService.createFeatureToggle(
            project,
            { name, description },
            auditUser,
        );

        return response;
    } catch (error) {
        return error;
    }
};

export const createFlag = ({
    featureService,
    auditUser,
}: createFlagOperationalParams): RunnableToolFunctionWithParse<createFlagParams> => ({
    type: 'function',
    function: {
        function: (params: createFlagParams) =>
            createFlagFunction({ ...params, featureService, auditUser }),
        name: 'createFlag',
        description:
            'Create a feature flag by name and project. Optionally supply a description',
        parse: JSON.parse,
        parameters: {
            type: 'object',
            properties: {
                project: {
                    type: 'string',
                    description: 'The project in which to create the flag',
                },
                name: { type: 'string', description: 'The name of the flag' },
                description: {
                    type: 'string',
                    description: 'The description of the flag',
                },
            },
            required: ['project', 'name'],
        },
    },
});
