import { IFeatureToggle } from 'interfaces/featureToggle';
import { styled } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';

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

export const FeatureOverviewSidePanelDetails = ({
    feature,
    header,
}: IFeatureOverviewSidePanelDetailsProps) => {
    const { locationSettings } = useLocationSettings();

    return (
        <StyledContainer>
            {header}
            <div data-loading>
                <StyledLabel>Created at:</StyledLabel>
                <span>
                    {formatDateYMD(
                        parseISO(feature.createdAt),
                        locationSettings.locale
                    )}
                </span>
            </div>
        </StyledContainer>
    );
};
