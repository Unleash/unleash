import useToast from '../../../../../../../hooks/useToast';
import useUiConfig from '../../../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';
import { useRequiredPathParam } from '../../../../../../../hooks/useRequiredPathParam';
import { useStrategy } from '../../../../../../../hooks/api/getters/useStrategy/useStrategy';
import React, { useEffect, useState } from 'react';
import { formatUnknownError } from '../../../../../../../utils/formatUnknownError';
import FormTemplate from '../../../../../../common/FormTemplate/FormTemplate';
import { UPDATE_FEATURE_STRATEGY } from '../../../../../../providers/AccessProvider/permissions';
import {
    IFeatureStrategy,
    IStrategy,
} from '../../../../../../../interfaces/strategy';
import { useRequiredQueryParam } from '../../../../../../../hooks/useRequiredQueryParam';
import { ISegment } from '../../../../../../../interfaces/segment';
import { useFormErrors } from '../../../../../../../hooks/useFormErrors';
import { useSegments } from '../../../../../../../hooks/api/getters/useSegments/useSegments';
import { formatStrategyName } from '../../../../../../../utils/strategyNames';
import { sortStrategyParameters } from '../../../../../../../utils/sortStrategyParameters';
import useProjectApi from '../../../../../../../hooks/api/actions/useProjectApi/useProjectApi';
import { usePlausibleTracker } from '../../../../../../../hooks/usePlausibleTracker';
import { ProjectDefaultStrategyForm } from './ProjectDefaultStrategyForm';
import { CreateFeatureStrategySchema } from '../../../../../../../openapi';
import useProject from '../../../../../../../hooks/api/getters/useProject/useProject';

interface EditDefaultStrategyProps {
    strategy: IFeatureStrategy | CreateFeatureStrategySchema;
}

const EditDefaultStrategy = ({ strategy }: EditDefaultStrategyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const environmentId = useRequiredQueryParam('environmentId');

    const { refetch: refetchProject } = useProject(projectId);

    const [defaultStrategy, setDefaultStrategy] = useState<
        Partial<IFeatureStrategy> | CreateFeatureStrategySchema
    >(strategy);

    const [segments, setSegments] = useState<ISegment[]>([]);
    const { updateDefaultStrategy, loading } = useProjectApi();
    const { strategyDefinition } = useStrategy(strategy.name);
    const { setToastData, setToastApiError } = useToast();
    const errors = useFormErrors();
    const { uiConfig } = useUiConfig();
    const { unleashUrl } = uiConfig;
    const navigate = useNavigate();

    const [previousTitle, setPreviousTitle] = useState<string>('');
    const { trackEvent } = usePlausibleTracker();

    const trackTitle = (title: string = '') => {
        // don't expose the title, just if it was added, removed, or edited
        if (title === previousTitle) {
            trackEvent('strategyTitle', {
                props: {
                    action: 'none',
                    on: 'edit',
                },
            });
        }
        if (previousTitle === '' && title !== '') {
            trackEvent('strategyTitle', {
                props: {
                    action: 'added',
                    on: 'edit',
                },
            });
        }
        if (previousTitle !== '' && title === '') {
            trackEvent('strategyTitle', {
                props: {
                    action: 'removed',
                    on: 'edit',
                },
            });
        }
        if (previousTitle !== '' && title !== '' && title !== previousTitle) {
            trackEvent('strategyTitle', {
                props: {
                    action: 'edited',
                    on: 'edit',
                },
            });
        }
    };

    const {
        segments: allSegments,
        refetchSegments: refetchSavedStrategySegments,
    } = useSegments();

    useEffect(() => {
        // Fill in the selected segments once they've been fetched.
        if (allSegments && strategy?.segments) {
            const temp: ISegment[] = [];
            for (const segmentId of strategy?.segments) {
                temp.push(
                    ...allSegments.filter(segment => segment.id === segmentId)
                );
            }
            setSegments(temp);
        }
    }, [JSON.stringify(allSegments), JSON.stringify(strategy.segments)]);

    const segmentsToSubmit = uiConfig?.flags.SE ? segments : [];
    const payload = createStrategyPayload(
        defaultStrategy as any,
        segmentsToSubmit
    );

    const onDefaultStrategyEdit = async (
        payload: CreateFeatureStrategySchema
    ) => {
        await updateDefaultStrategy(projectId, environmentId, payload);

        if (uiConfig?.flags?.strategyImprovements && strategy.title) {
            // NOTE: remove tracking when feature flag is removed
            trackTitle(strategy.title);
        }

        await refetchSavedStrategySegments();
        setToastData({
            title: 'Default Strategy updated',
            type: 'success',
            confetti: true,
        });
    };

    const onSubmit = async () => {
        const path = `/projects/${projectId}/settings/default-strategy`;
        try {
            await onDefaultStrategyEdit(payload);
            await refetchProject();
            navigate(path);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    if (!strategyDefinition) {
        return null;
    }

    if (!defaultStrategy) return null;

    return (
        <FormTemplate
            modal
            title={formatStrategyName(strategy.name ?? '')}
            description={projectDefaultStrategyHelp}
            documentationLink={projectDefaultStrategyDocsLink}
            documentationLinkLabel={projectDefaultStrategyDocsLinkLabel}
            formatApiCode={() =>
                formatUpdateStrategyApiCode(
                    projectId,
                    environmentId,
                    payload,
                    strategyDefinition,
                    unleashUrl
                )
            }
        >
            <ProjectDefaultStrategyForm
                projectId={projectId}
                strategy={defaultStrategy as any}
                setStrategy={setDefaultStrategy}
                segments={segments}
                setSegments={setSegments}
                environmentId={environmentId}
                onSubmit={onSubmit}
                loading={loading}
                permission={UPDATE_FEATURE_STRATEGY}
                errors={errors}
                isChangeRequest={false}
            />
        </FormTemplate>
    );
};

export const createStrategyPayload = (
    strategy: CreateFeatureStrategySchema,
    segments: ISegment[]
): CreateFeatureStrategySchema => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: strategy.parameters ?? {},
    segments: segments.map(segment => segment.id),
    disabled: strategy.disabled ?? false,
});

export const formatUpdateStrategyApiCode = (
    projectId: string,
    environmentId: string,
    strategy: CreateFeatureStrategySchema,
    strategyDefinition: IStrategy,
    unleashUrl?: string
): string => {
    if (!unleashUrl) {
        return '';
    }

    // Sort the strategy parameters payload so that they match
    // the order of the input fields in the form, for usability.
    const sortedStrategy = {
        ...strategy,
        parameters: sortStrategyParameters(
            strategy.parameters ?? {},
            strategyDefinition
        ),
    };

    const url = `${unleashUrl}/api/admin/projects/${projectId}/environments/${environmentId}/default-strategy}`;
    const payload = JSON.stringify(sortedStrategy, undefined, 2);

    return `curl --location --request PUT '${url}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${payload}'`;
};

export const projectDefaultStrategyHelp = `
    An activation strategy will only run when a feature toggle is enabled and provides a way to control who will get access to the feature.
    If any of a feature toggle's activation strategies returns true, the user will get access.
`;

export const projectDefaultStrategyDocsLink =
    'https://docs.getunleash.io/reference/activation-strategies';

export const projectDefaultStrategyDocsLinkLabel =
    'Default strategy documentation';

export default EditDefaultStrategy;
