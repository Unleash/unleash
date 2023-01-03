import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { useState } from 'react';
import { FeatureOverviewSidePanelEnvironmentSwitch } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanelEnvironmentSwitches/FeatureOverviewSidePanelEnvironmentSwitch/FeatureOverviewSidePanelEnvironmentSwitch';
import { Link, styled, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
}));

const StyledSwitchLabel = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

const StyledSubLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledLink = styled(Link<typeof RouterLink | 'a'>)(() => ({
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

interface IFeatureOverviewSidePanelEnvironmentSwitchesProps {
    feature: IFeatureToggle;
    header: React.ReactNode;
    hiddenEnvironments: Set<String>;
    setHiddenEnvironments: (environment: string) => void;
}

export const FeatureOverviewSidePanelEnvironmentSwitches = ({
    feature,
    header,
    hiddenEnvironments,
    setHiddenEnvironments,
}: IFeatureOverviewSidePanelEnvironmentSwitchesProps) => {
    const [showInfoBox, setShowInfoBox] = useState(false);
    const [environmentName, setEnvironmentName] = useState('');

    return (
        <StyledContainer>
            {header}
            {feature.environments.map(environment => {
                const strategiesLabel =
                    environment.strategies.length === 1
                        ? '1 strategy'
                        : `${environment.strategies.length} strategies`;

                const variants = environment.variants ?? [];

                const variantsLink = variants.length > 0 && (
                    <>
                        {' - '}
                        <Tooltip title="View variants" arrow describeChild>
                            <StyledLink
                                component={RouterLink}
                                to={`/projects/${feature.project}/features/${feature.name}/variants`}
                                underline="hover"
                            >
                                {variants.length === 1
                                    ? '1 variant'
                                    : `${variants.length} variants`}
                            </StyledLink>
                        </Tooltip>
                    </>
                );

                return (
                    <FeatureOverviewSidePanelEnvironmentSwitch
                        key={environment.name}
                        environment={environment}
                        hiddenEnvironments={hiddenEnvironments}
                        setHiddenEnvironments={setHiddenEnvironments}
                        showInfoBox={() => {
                            setEnvironmentName(environment.name);
                            setShowInfoBox(true);
                        }}
                    >
                        <StyledSwitchLabel>
                            <StyledLabel>{environment.name}</StyledLabel>
                            <StyledSubLabel>
                                {strategiesLabel}
                                {variantsLink}
                            </StyledSubLabel>
                        </StyledSwitchLabel>
                    </FeatureOverviewSidePanelEnvironmentSwitch>
                );
            })}
            <EnvironmentStrategyDialog
                open={showInfoBox}
                onClose={() => setShowInfoBox(false)}
                projectId={feature.project}
                featureId={feature.name}
                environmentName={environmentName}
            />
        </StyledContainer>
    );
};
