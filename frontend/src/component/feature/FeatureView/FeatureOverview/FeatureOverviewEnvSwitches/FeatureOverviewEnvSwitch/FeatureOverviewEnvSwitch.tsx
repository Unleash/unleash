import { useParams } from 'react-router';
import { ENVIRONMENT_STRATEGY_ERROR } from '../../../../../../constants/apiErrors';
import useFeatureApi from '../../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from '../../../../../../hooks/api/getters/useFeature/useFeature';
import useToast from '../../../../../../hooks/useToast';
import { IFeatureEnvironment } from '../../../../../../interfaces/featureToggle';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import PermissionSwitch from '../../../../../common/PermissionSwitch/PermissionSwitch';
import StringTruncator from '../../../../../common/StringTruncator/StringTruncator';
import { UPDATE_FEATURE_ENVIRONMENT } from '../../../../../providers/AccessProvider/permissions';
import React from 'react';
import { formatUnknownError } from '../../../../../../utils/format-unknown-error';

interface IFeatureOverviewEnvSwitchProps {
    env: IFeatureEnvironment;
    callback?: () => void;
    text?: string;
    showInfoBox?: () => void;
}

const FeatureOverviewEnvSwitch = ({
    env,
    callback,
    text,
    showInfoBox,
}: IFeatureOverviewEnvSwitchProps) => {
    const { featureId, projectId } = useParams<IFeatureViewParams>();
    const { toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();

    const handleToggleEnvironmentOn = async () => {
        try {
            await toggleFeatureEnvironmentOn(projectId, featureId, env.name);
            setToastData({
                type: 'success',
                title: 'Environment turned on',
                text: 'Successfully turned environment on. Strategies are executing in this environment.',
            });
            refetchFeature();
            if (callback) {
                callback();
            }
        } catch (e) {
            // @ts-expect-error
            if (e.message === ENVIRONMENT_STRATEGY_ERROR) {
                // @ts-expect-error
                showInfoBox(true);
            } else {
                // @ts-expect-error
                setToastApiError(e.message);
            }
        }
    };

    const handleToggleEnvironmentOff = async () => {
        try {
            await toggleFeatureEnvironmentOff(projectId, featureId, env.name);
            setToastData({
                type: 'success',
                title: 'Environment turned off',
                text: 'Successfully turned environment off. Strategies are no longer executing in this environment.',
            });
            refetchFeature();
            if (callback) {
                callback();
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const toggleEnvironment = async (e: React.ChangeEvent) => {
        if (env.enabled) {
            await handleToggleEnvironmentOff();
            return;
        }
        await handleToggleEnvironmentOn();
    };

    let content = text ? (
        text
    ) : (
        <>
            {' '}
            <span data-loading>{env.enabled ? 'enabled' : 'disabled'} in</span>
            &nbsp;
            <StringTruncator text={env.name} maxWidth="120" />
        </>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <PermissionSwitch
                permission={UPDATE_FEATURE_ENVIRONMENT}
                projectId={projectId}
                checked={env.enabled}
                onChange={toggleEnvironment}
                environmentId={env.name}
            />
            {content}
        </div>
    );
};

export default FeatureOverviewEnvSwitch;
