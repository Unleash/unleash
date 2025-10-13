import { Box, styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Link } from 'react-router-dom';
import { StrategyExecution } from '../../EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution.js';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.js';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.js';
import { UPDATE_FEATURE } from '@server/types/permissions.js';
import type { IFeatureStrategy } from 'interfaces/strategy.js';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled.js';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi.js';
import useToast from 'hooks/useToast.js';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests.js';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature.js';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi.js';

const StyledSuggestion = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 3),
    background: theme.palette.secondary.light,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    color: theme.palette.primary.main,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledBold = styled('b')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'underline',
}));

const TooltipHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const TooltipDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    paddingBottom: theme.spacing(1.5),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
}));

type DefaultStrategySuggestionProps = {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: Omit<IFeatureStrategy, 'id'>;
};

export const EnvironmentStrategySuggestion = ({
    projectId,
    featureId,
    environmentId,
    strategy,
}: DefaultStrategySuggestionProps) => {
    const { trackEvent } = usePlausibleTracker();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { setToastData } = useToast();
    const editDefaultStrategyPath = `/projects/${projectId}/settings/default-strategy`;
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetchFeature } = useFeature(projectId, featureId);

    const openStrategyCreationModal = async () => {
        trackEvent('suggestion-strategy-add', {
            props: {
                buttonTitle: 'flexibleRollout',
            },
        });
        const payload = {
            name: strategy.name,
            title: strategy.title ?? '',
            constraints: strategy.constraints ?? [],
            parameters: strategy.parameters ?? {},
            variants: strategy.variants ?? [],
            segments: strategy.segments ?? [],
            disabled: strategy.disabled ?? false,
        };
        if (isChangeRequestConfigured(environmentId)) {
            await addChange(projectId, environmentId, {
                action: 'addStrategy',
                feature: featureId,
                payload,
            });

            setToastData({
                text: 'Strategy added to draft',
                type: 'success',
            });
            refetchChangeRequests();
        } else {
            await addStrategyToFeature(
                projectId,
                featureId,
                environmentId,
                payload,
            );

            setToastData({
                text: 'Strategy applied',
                type: 'success',
            });
        }
        refetchFeature();
    };

    return (
        <StyledSuggestion>
            <StyledBold>Suggestion:</StyledBold>
            &nbsp;Add the&nbsp;
            <HtmlTooltip
                title={
                    <StyledBox>
                        <TooltipHeader>Default strategy</TooltipHeader>
                        <TooltipDescription>
                            Defined per project, per environment&nbsp;
                            <Link
                                to={editDefaultStrategyPath}
                                title='Project default strategies'
                            >
                                here
                            </Link>
                        </TooltipDescription>
                        <StrategyExecution strategy={strategy} />
                    </StyledBox>
                }
                maxWidth='200'
                arrow
            >
                <StyledSpan>default strategy</StyledSpan>
            </HtmlTooltip>
            &nbsp;for this project&nbsp;
            <PermissionButton
                size='small'
                permission={UPDATE_FEATURE}
                projectId={projectId}
                variant='text'
                onClick={() => openStrategyCreationModal()}
            >
                Apply
            </PermissionButton>
        </StyledSuggestion>
    );
};
