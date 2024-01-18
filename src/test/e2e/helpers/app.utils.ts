import { CreateFeatureStrategySchema } from '../../../lib/openapi';
import { IUnleashTest } from './test-helper';

export const FEATURES_BASE_PATH = '/api/admin/projects/default/features';
export const ADMIN_BASE_PATH = '/api/admin';

export const createFeatureToggle = (
    app: IUnleashTest,
    postData: object,
    expectStatusCode = 201,
): Promise<unknown> =>
    app.request
        .post(FEATURES_BASE_PATH)
        .send(postData)
        .expect(expectStatusCode);

export const addStrategyToFeatureEnv = (
    app: IUnleashTest,
    postData: CreateFeatureStrategySchema,
    envName: string,
    featureName: string,
    expectStatusCode = 200,
): Promise<any> => {
    const url = `${ADMIN_BASE_PATH}/projects/default/features/${featureName}/environments/${envName}/strategies`;
    return app.request.post(url).send(postData).expect(expectStatusCode);
};
