import {
    IFeatureToggle,
    ILastSeenEnvironments,
} from 'interfaces/featureToggle';
import { styled } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { FeatureEnvironmentSeen } from '../../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { DependencyRow } from './DependencyRow';
import { FlexRow, StyledDetail, StyledLabel } from './StyledRow';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useShowDependentFeatures } from './useShowDependentFeatures';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    padding: theme.spacing(3),
    fontSize: theme.fontSizes.smallBody,
}));

interface IFeatureOverviewSidePanelDetailsProps {
    feature: IFeatureToggle;
    header: React.ReactNode;
}
export const FeatureOverviewSidePanelDetails = ({
    feature,
    header,
}: IFeatureOverviewSidePanelDetailsProps) => {
    const { locationSettings } = useLocationSettings();
    const { uiConfig } = useUiConfig();
    const showDependentFeatures = useShowDependentFeatures(feature.project);

    const lastSeenEnvironments: ILastSeenEnvironments[] =
        feature.environments?.map((env) => ({
            name: env.name,
            lastSeenAt: env.lastSeenAt,
            enabled: env.enabled,
        }));

    return (
        <StyledContainer>
            {header}
            <FlexRow>
                <StyledDetail>
                    <StyledLabel>Created at:</StyledLabel>
                    <span>
                        {formatDateYMD(
                            parseISO(feature.createdAt),
                            locationSettings.locale,
                        )}
                    </span>
                </StyledDetail>

                <FeatureEnvironmentSeen
                    featureLastSeen={feature.lastSeenAt}
                    environments={lastSeenEnvironments}
                    sx={{ p: 0 }}
                />
            </FlexRow>
            <ConditionallyRender
                condition={showDependentFeatures}
                show={<DependencyRow feature={feature} />}
            />
        </StyledContainer>
    );
};
