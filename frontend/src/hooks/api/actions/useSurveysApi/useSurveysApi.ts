import type { CreateFeatureStrategySchema, FeatureSchema } from 'openapi';
import { NotFoundError } from 'utils/apiUtils';
import useAPI from '../useApi/useApi.js';
import useFeatureApi from '../useFeatureApi/useFeatureApi.js';
import useFeatureStrategyApi from '../useFeatureStrategyApi/useFeatureStrategyApi.js';
import useTagTypesApi from '../useTagTypesApi/useTagTypesApi.js';

const SURVEY_TAG = { type: 'role', value: 'survey' };

export type SurveyStrategiesResult =
    | { status: 'added' }
    | { status: 'failed'; environments: string[] | 'all' };

export type CreateSurveyResult = {
    tag: 'added' | 'failed';
    strategies: SurveyStrategiesResult;
};

const surveyStrategy = (
    name: string,
    surveyJson: string,
): CreateFeatureStrategySchema => ({
    name: 'flexibleRollout',
    parameters: { rollout: '100', stickiness: 'default', groupId: name },
    variants: [
        {
            name: 'survey',
            weight: 1000,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'json', value: surveyJson },
        },
    ],
});

export const useSurveysApi = () => {
    const { loading, makeRequest, createRequest } = useAPI({
        propagateErrors: true,
    });
    const {
        createFeatureToggle,
        updateFeatureTags,
        loading: featureLoading,
    } = useFeatureApi();
    const { createTag: createTagType, loading: tagTypeLoading } =
        useTagTypesApi();
    const { addStrategyToFeature, loading: strategyLoading } =
        useFeatureStrategyApi();

    const get = async (path: string) => {
        const req = createRequest(path, { method: 'GET' });
        return makeRequest(req.caller, req.id);
    };

    const ensureSurveyTagType = async () => {
        try {
            await get(`api/admin/tag-types/${SURVEY_TAG.type}`);
        } catch (error: unknown) {
            if (!(error instanceof NotFoundError)) {
                throw error;
            }
            await createTagType({
                name: SURVEY_TAG.type,
                description: 'What a flag is used for',
            });
        }
    };

    const tagAsSurvey = async (name: string) => {
        await ensureSurveyTagType();
        await updateFeatureTags(name, {
            addedTags: [SURVEY_TAG],
            removedTags: [],
        });
    };

    const addSurveyStrategies = async (
        projectId: string,
        name: string,
        surveyJson: string,
    ): Promise<SurveyStrategiesResult> => {
        let environments: string[];
        try {
            const flag: FeatureSchema = await (
                await get(`api/admin/projects/${projectId}/features/${name}`)
            ).json();
            environments = (flag.environments ?? []).map(
                (environment) => environment.name,
            );
        } catch {
            return { status: 'failed', environments: 'all' };
        }

        const results = await Promise.allSettled(
            environments.map((environment) =>
                addStrategyToFeature(
                    projectId,
                    name,
                    environment,
                    surveyStrategy(name, surveyJson),
                ),
            ),
        );
        const failed = environments.filter(
            (_, index) => results[index].status === 'rejected',
        );
        return failed.length === 0
            ? { status: 'added' }
            : { status: 'failed', environments: failed };
    };

    const createSurvey = async (
        projectId: string,
        name: string,
        surveyJson: string,
    ): Promise<CreateSurveyResult> => {
        await createFeatureToggle(projectId, { name, type: 'experiment' });

        const tag = await tagAsSurvey(name).then(
            () => 'added' as const,
            () => 'failed' as const,
        );
        const strategies = await addSurveyStrategies(
            projectId,
            name,
            surveyJson,
        );
        return { tag, strategies };
    };

    return {
        createSurvey,
        loading: loading || featureLoading || tagTypeLoading || strategyLoading,
    };
};
