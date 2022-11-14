import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { SectionSeparator } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/SectionSeparator/SectionSeparator';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useStyles } from './FeatureStrategyEmpty.styles';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useFeatureImmutable } from 'hooks/api/getters/useFeature/useFeatureImmutable';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { CopyButton } from './CopyButton/CopyButton';
import { useChangeRequestAddStrategy } from 'hooks/useChangeRequestAddStrategy';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import { CopyStrategiesMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/CopyStrategiesMessage';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { getFeatureStrategyIcon } from 'utils/strategyNames';
import { AddFromTemplateCard } from './AddFromTemplateCard/AddFromTemplateCard';
import { FeatureStrategyMenu } from '../FeatureStrategyMenu/FeatureStrategyMenu';

interface IFeatureStrategyEmptyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
}

export const FeatureStrategyEmpty = ({
    projectId,
    featureId,
    environmentId,
}: IFeatureStrategyEmptyProps) => {
    const { classes: styles } = useStyles();
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { refetchFeature: refetchFeatureImmutable } = useFeatureImmutable(
        projectId,
        featureId
    );
    const { feature } = useFeature(projectId, featureId);
    const otherAvailableEnvironments = feature?.environments.filter(
        environment =>
            environment.name !== environmentId &&
            environment.strategies &&
            environment.strategies.length > 0
    );
    const isChangeRequestEnabled = useChangeRequestsEnabled(environmentId);

    const {
        changeRequestDialogDetails,
        onChangeRequestAddStrategies,
        onChangeRequestAddStrategiesConfirm,
        onChangeRequestAddStrategyClose,
    } = useChangeRequestAddStrategy(projectId, featureId, 'addStrategy');

    const onAfterAddStrategy = (multiple = false) => {
        refetchFeature();
        refetchFeatureImmutable();

        setToastData({
            title: multiple ? 'Strategies created' : 'Strategy created',
            text: multiple
                ? 'Successfully copied from another environment'
                : 'Successfully created strategy',
            type: 'success',
        });
    };

    const onCopyStrategies = async (fromEnvironmentName: string) => {
        const strategies =
            otherAvailableEnvironments?.find(
                environment => environment.name === fromEnvironmentName
            )?.strategies || [];

        if (isChangeRequestEnabled) {
            await onChangeRequestAddStrategies(
                environmentId,
                strategies,
                fromEnvironmentName
            );
            return;
        }

        try {
            await Promise.all(
                strategies.map(strategy => {
                    const { id, ...strategyCopy } = {
                        ...strategy,
                        environment: environmentId,
                        copyOf: strategy.id,
                    };

                    return addStrategyToFeature(
                        projectId,
                        featureId,
                        environmentId,
                        strategyCopy
                    );
                })
            );
            onAfterAddStrategy(true);
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const canCopyFromOtherEnvironment =
        otherAvailableEnvironments && otherAvailableEnvironments.length > 0;

    return (
        <>
            <ChangeRequestDialogue
                isOpen={changeRequestDialogDetails.isOpen}
                onClose={onChangeRequestAddStrategyClose}
                environment={changeRequestDialogDetails?.environment}
                onConfirm={onChangeRequestAddStrategiesConfirm}
                messageComponent={
                    <CopyStrategiesMessage
                        fromEnvironment={
                            changeRequestDialogDetails.fromEnvironment!
                        }
                        payload={changeRequestDialogDetails.strategies!}
                    />
                }
            />

            <div className={styles.container}>
                <div className={styles.title}>
                    You have not defined any strategies yet.
                </div>
                <p className={styles.description}>
                    Strategies added in this environment will only be executed
                    if the SDK is using an{' '}
                    <Link to="/admin/api">API key configured</Link> for this
                    environment.
                </p>
                <Box
                    sx={{
                        w: '100%',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FeatureStrategyMenu
                        label="Add your first strategy"
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        matchWidth={canCopyFromOtherEnvironment}
                    />
                    <ConditionallyRender
                        condition={canCopyFromOtherEnvironment}
                        show={
                            <CopyButton
                                environmentId={environmentId}
                                environments={otherAvailableEnvironments.map(
                                    environment => environment.name
                                )}
                                onClick={onCopyStrategies}
                            />
                        }
                    />
                </Box>
                <Box sx={{ width: '100%', mt: 3 }}>
                    <SectionSeparator>
                        Or use a strategy template
                    </SectionSeparator>
                </Box>
                <Box
                    sx={{
                        display: 'grid',
                        width: '100%',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    }}
                >
                    <AddFromTemplateCard
                        title="Standard strategy"
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        onAfterAddStrategy={onAfterAddStrategy}
                        Icon={getFeatureStrategyIcon('default')}
                        strategy={{
                            name: 'default',
                            parameters: {},
                            constraints: [],
                        }}
                    >
                        The standard strategy is strictly on/off for your entire
                        userbase.
                    </AddFromTemplateCard>
                    <AddFromTemplateCard
                        title="Gradual rollout"
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        onAfterAddStrategy={onAfterAddStrategy}
                        Icon={getFeatureStrategyIcon('flexibleRollout')}
                        strategy={{
                            name: 'flexibleRollout',
                            parameters: {
                                rollout: '50',
                                stickiness: 'default',
                                groupId: feature.name,
                            },
                            constraints: [],
                        }}
                    >
                        Roll out to a percentage of your userbase.
                    </AddFromTemplateCard>
                </Box>
            </div>
        </>
    );
};
