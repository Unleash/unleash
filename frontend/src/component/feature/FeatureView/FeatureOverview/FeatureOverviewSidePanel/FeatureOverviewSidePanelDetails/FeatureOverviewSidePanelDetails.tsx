import { IFeatureToggle } from 'interfaces/featureToggle';
import { styled } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { FeatureEnvironmentSeen } from '../../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
}));

interface IFeatureOverviewSidePanelDetailsProps {
    feature: IFeatureToggle;
    header: React.ReactNode;
}

const FlexRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

const StyledDetail = styled('div')(({ theme }) => ({
    justifyContent: 'center',
    paddingTop: theme.spacing(0.75),
}));

export const FeatureOverviewSidePanelDetails = ({
    feature,
    header,
}: IFeatureOverviewSidePanelDetailsProps) => {
    const { locationSettings } = useLocationSettings();
    const { uiConfig } = useUiConfig();

    const showLastSeenByEnvironment = Boolean(
        uiConfig.flags.lastSeenByEnvironment
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
                            locationSettings.locale
                        )}
                    </span>
                </StyledDetail>
                {showLastSeenByEnvironment && (
                    <FeatureEnvironmentSeen
                        featureLastSeen={feature.lastSeenAt}
                        environments={feature.environments}
                        sx={{ pt: 0 }}
                    />
                )}
            </FlexRow>
        </StyledContainer>
    );
};
