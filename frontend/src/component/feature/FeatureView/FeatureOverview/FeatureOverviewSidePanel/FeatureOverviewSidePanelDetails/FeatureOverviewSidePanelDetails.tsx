import { IFeatureToggle } from 'interfaces/featureToggle';
import { styled } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { FeatureEnvironmentSeen } from '../../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { DependencyRow } from './DependencyRow';
import { FlexRow, StyledDetail, StyledLabel } from './StyledRow';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
    const dependentFeatures = useUiFlag('dependentFeatures');

    const showLastSeenByEnvironment = Boolean(
        uiConfig.flags.lastSeenByEnvironment,
    );

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
                {showLastSeenByEnvironment && (
                    <FeatureEnvironmentSeen
                        featureLastSeen={feature.lastSeenAt}
                        environments={feature.environments}
                        sx={{ p: 0 }}
                    />
                )}
            </FlexRow>
            <ConditionallyRender
                condition={dependentFeatures}
                show={<DependencyRow feature={feature} />}
            />
        </StyledContainer>
    );
};
