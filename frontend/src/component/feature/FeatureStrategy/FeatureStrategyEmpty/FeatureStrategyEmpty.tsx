import { Link } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { SectionSeparator } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/SectionSeparator/SectionSeparator';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
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
import { LegacyFeatureStrategyMenu } from '../FeatureStrategyMenu/LegacyFeatureStrategyMenu';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IFeatureStrategyEmptyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
}));

const StyledTitle = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    textAlign: 'center',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    textAlign: 'center',
    marginBottom: theme.spacing(3),

    a: {
        color: theme.palette.links,
    },
}));

export const FeatureStrategyEmpty = ({
    projectId,
    featureId,
    environmentId,
}: IFeatureStrategyEmptyProps) => {
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
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const {
        changeRequestDialogDetails,
        onChangeRequestAddStrategies,
        onChangeRequestAddStrategiesConfirm,
        onChangeRequestAddStrategyClose,
    } = useChangeRequestAddStrategy(projectId, featureId, 'addStrategy');

    const { uiConfig } = useUiConfig();
    const strategySplittedButton = uiConfig?.flags?.strategySplittedButton;

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

        if (isChangeRequestConfigured(environmentId)) {
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

            <StyledContainer>
                <StyledTitle>
                    You have not defined any strategies yet.
                </StyledTitle>
                <StyledDescription>
                    Strategies added in this environment will only be executed
                    if the SDK is using an{' '}
                    <Link to="/admin/api">API key configured</Link> for this
                    environment.
                </StyledDescription>
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
                    <ConditionallyRender
                        condition={Boolean(strategySplittedButton)}
                        show={
                            <FeatureStrategyMenu
                                label="Add your first strategy"
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environmentId}
                                matchWidth={canCopyFromOtherEnvironment}
                            />
                        }
                        elseShow={
                            <LegacyFeatureStrategyMenu
                                label="Add your first strategy"
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environmentId}
                                matchWidth={canCopyFromOtherEnvironment}
                            />
                        }
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
                <ConditionallyRender
                    condition={strategySplittedButton === false}
                    show={
                        <>
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
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: '1fr 1fr',
                                    },
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
                                    The standard strategy is strictly on/off for
                                    your entire userbase.
                                </AddFromTemplateCard>
                                <AddFromTemplateCard
                                    title="Gradual rollout"
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={environmentId}
                                    onAfterAddStrategy={onAfterAddStrategy}
                                    Icon={getFeatureStrategyIcon(
                                        'flexibleRollout'
                                    )}
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
                        </>
                    }
                />
            </StyledContainer>
        </>
    );
};
