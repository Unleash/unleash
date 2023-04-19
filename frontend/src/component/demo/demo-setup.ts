import { IFeatureToggle } from 'interfaces/featureToggle';
import { formatApiPath } from 'utils/formatPath';

export const gradualRollout = async () => {
    const projectId = 'default';
    const featureId = 'demoApp.step3';
    const environmentId = 'default';

    const { environments }: IFeatureToggle = await fetch(
        formatApiPath(
            `api/admin/projects/${projectId}/features/${featureId}?variantEnvironments=true`
        )
    ).then(res => res.json());

    const strategies =
        environments.find(({ name }) => name === environmentId)?.strategies ||
        [];

    if (!strategies.find(({ name }) => name === 'flexibleRollout')) {
        await fetch(
            formatApiPath(
                `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`
            ),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'flexibleRollout',
                    constraints: [],
                    parameters: {
                        rollout: '50',
                        stickiness: 'userId',
                        groupId: featureId,
                    },
                }),
            }
        );
    }
};
