import { IFeatureToggle } from 'interfaces/featureToggle';
import { styled } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { FeatureEnvironmentSeenCell } from '../../../../../common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { FeatureEnvironmentSeen } from '../../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';

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

const StyledDetail = styled('div')({
    justifyContent: 'center',
});

export const FeatureOverviewSidePanelDetails = ({
    feature,
    header,
}: IFeatureOverviewSidePanelDetailsProps) => {
    const { locationSettings } = useLocationSettings();

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
                <FeatureEnvironmentSeen
                    featureLastSeen={feature.lastSeenAt}
                    environments={feature.environments}
                    sx={{ pt: 0 }}
                />
            </FlexRow>
        </StyledContainer>
    );
};
