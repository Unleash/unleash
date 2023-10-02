import { IUnleashContextDefinition } from 'interfaces/context';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { formatApiPath } from 'utils/formatPath';

const PROJECT = 'demo-app';
const ENVIRONMENT = 'dev';

const ensureUserIdContextExists = async () => {
    const contextFields: IUnleashContextDefinition[] =
        (await fetch(formatApiPath('api/admin/context')).then((res) =>
            res.json(),
        )) || [];

    if (!contextFields.find(({ name }) => name === 'userId')) {
        await fetch(formatApiPath('api/admin/context'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'userId',
                description: 'Allows you to constrain on userId',
                legalValues: [],
                stickiness: true,
            }),
        });
    }
};

export const specificUser = async () => {
    await deleteOldStrategies('demoApp.step2');
    await ensureUserIdContextExists();
};

export const gradualRollout = async () => {
    const featureId = 'demoApp.step3';

    const { environments }: IFeatureToggle = await fetch(
        formatApiPath(
            `api/admin/projects/${PROJECT}/features/${featureId}?variantEnvironments=true`,
        ),
    ).then((res) => res.json());

    const strategies =
        environments.find(({ name }) => name === ENVIRONMENT)?.strategies || [];

    if (!strategies.find(({ name }) => name === 'flexibleRollout')) {
        await fetch(
            formatApiPath(
                `api/admin/projects/${PROJECT}/features/${featureId}/environments/${ENVIRONMENT}/strategies`,
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
                        stickiness: 'default',
                        groupId: featureId,
                    },
                }),
            },
        );
    }
};

const deleteStrategy = (featureId: string, strategyId: string) =>
    fetch(
        formatApiPath(
            `api/admin/projects/${PROJECT}/features/${featureId}/environments/${ENVIRONMENT}/strategies/${strategyId}`,
        ),
        { method: 'DELETE' },
    );

const deleteOldStrategies = async (featureId: string) => {
    const results = await fetch(
        formatApiPath(
            `api/admin/projects/${PROJECT}/features/${featureId}/environments/${ENVIRONMENT}/strategies`,
        ),
    ).then((res) => res.json());

    const tooGenericStrategies = results.filter(
        (strategy: { constraints: Array<unknown>; segments: Array<unknown> }) =>
            strategy.constraints.length === 0 && strategy.segments.length === 0,
    );
    const constrainedStrategies = results.filter(
        (strategy: { constraints: Array<unknown>; segments: Array<unknown> }) =>
            strategy.constraints.length > 0 || strategy.segments.length > 0,
    );
    await Promise.all(
        tooGenericStrategies.map((result: { id: string }) =>
            deleteStrategy(featureId, result.id),
        ),
    );

    const strategyLimit = 30;
    if (constrainedStrategies.length > strategyLimit) {
        await Promise.all(
            constrainedStrategies
                .slice(0, strategyLimit - 1)
                .map((result: { id: string }) =>
                    deleteStrategy(featureId, result.id),
                ),
        );
    }
};

const ensureDefaultVariants = async (featureId: string) => {
    const { variants }: IFeatureToggle = await fetch(
        formatApiPath(
            `api/admin/projects/${PROJECT}/features/${featureId}?variantEnvironments=true`,
        ),
    ).then((res) => res.json());

    if (!variants.length) {
        await fetch(
            formatApiPath(
                `api/admin/projects/${PROJECT}/features/${featureId}/environments/${ENVIRONMENT}/variants`,
            ),
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([
                    {
                        op: 'add',
                        path: '/0',
                        value: {
                            name: 'red',
                            weightType: 'variable',
                            weight: 333,
                            overrides: [],
                            stickiness: 'default',
                            payload: {
                                type: 'string',
                                value: 'red',
                            },
                        },
                    },
                    {
                        op: 'add',
                        path: '/1',
                        value: {
                            name: 'green',
                            weightType: 'variable',
                            weight: 333,
                            overrides: [],
                            stickiness: 'default',
                            payload: {
                                type: 'string',
                                value: 'green',
                            },
                        },
                    },
                    {
                        op: 'add',
                        path: '/2',
                        value: {
                            name: 'blue',
                            weightType: 'variable',
                            weight: 333,
                            overrides: [],
                            stickiness: 'default',
                            payload: {
                                type: 'string',
                                value: 'blue',
                            },
                        },
                    },
                ]),
            },
        );
    }
};

export const variants = async () => {
    await deleteOldStrategies('demoApp.step4');
    await ensureDefaultVariants('demoApp.step4');
    await ensureUserIdContextExists();
};
