import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { useState } from 'react';
import { FeatureOverviewSidePanelEnvironmentSwitch } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSidePanel/FeatureOverviewSidePanelEnvironmentSwitches/FeatureOverviewSidePanelEnvironmentSwitch/FeatureOverviewSidePanelEnvironmentSwitch';
import { Link, styled, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { WarningAmber } from '@mui/icons-material';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
}));

const StyledSwitchLabel = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledWarningAmber = styled(WarningAmber)(({ theme }) => ({
    color: theme.palette.warning.main,
    fontSize: theme.fontSizes.bodySize,
    marginLeft: theme.spacing(1),
}));

const StyledLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

const StyledSubLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
}));

const StyledSeparator = styled('span')(({ theme }) => ({
    padding: theme.spacing(0, 0.5),
    '::after': {
        content: '"-"',
    },
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
    const someEnabledEnvironmentHasVariants = feature.environments.some(
        environment => environment.enabled && environment.variants?.length
    );
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
                        <StyledSeparator />
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
                                <ConditionallyRender
                                    condition={
                                        variants.length == 0 &&
                                        environment.enabled &&
                                        someEnabledEnvironmentHasVariants
                                    }
                                    show={
                                        <HtmlTooltip
                                            arrow
                                            title={
                                                <>
                                                    This environment has no
                                                    variants enabled. If you
                                                    check this feature's
                                                    variants in this
                                                    environment, you will get
                                                    the{' '}
                                                    <a
                                                        href="https://docs.getunleash.io/reference/feature-toggle-variants#the-disabled-variant"
                                                        target="_blank"
                                                    >
                                                        disabled variant
                                                    </a>
                                                    .
                                                </>
                                            }
                                        >
                                            <StyledWarningAmber />
                                        </HtmlTooltip>
                                    }
                                />
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
