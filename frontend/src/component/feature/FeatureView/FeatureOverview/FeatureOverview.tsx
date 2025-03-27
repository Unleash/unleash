import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';
import Close from '@mui/icons-material/Close';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import {
    FeatureStrategyEdit,
    formatFeaturePath,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { Box, Button, IconButton, styled } from '@mui/material';
import { FeatureStrategyCreate } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { useEffect, useState } from 'react';
import { useLastViewedFlags } from 'hooks/useLastViewedFlags';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureOverviewEnvironments } from './FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import { default as LegacyFleatureOverview } from './LegacyFeatureOverview';
import { useEnvironmentVisibility } from './FeatureOverviewMetaData/EnvironmentVisibilityMenu/hooks/useEnvironmentVisibility';
import Joyride, { type TooltipRenderProps } from 'react-joyride';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledMainContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: theme.spacing(2),
}));

const StyledTooltip = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    maxWidth: '300px',
    background: '#201e42',
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.common.white,
    transform: 'translateX(35%)',
    padding: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
}));

const OkButton = styled(Button)(({ theme }) => ({
    color: theme.palette.secondary.border,
    alignSelf: 'start',
    marginLeft: theme.spacing(-1),
}));

// const TopRow = styled('div')(({ theme }) => ({
//     fontSize: theme.typography.body1.fontSize,
//     display: 'flex',
//     flexDirection: 'row',
//     alignItems: 'top',
// }));
//
const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.common.white,
    background: 'none',
    border: 'none',
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    svg: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
}));

const StyledHeader = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
}));

const CustomTooltip = ({ closeProps }: TooltipRenderProps) => {
    return (
        <StyledTooltip component='article'>
            <StyledCloseButton type='button' {...closeProps}>
                <Close />
            </StyledCloseButton>
            <StyledHeader>Decide the order evaluation</StyledHeader>
            <p>
                Strategies are evaluated in the order presented here. Drag and
                rearrange the strategies to get the order you prefer.
            </p>
            <OkButton
                type='button'
                data-action={closeProps['data-action']}
                onClick={closeProps.onClick}
            >
                Ok, got it!
            </OkButton>
        </StyledTooltip>
    );
};

export const FeatureOverview = () => {
    const navigate = useNavigate();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const featurePath = formatFeaturePath(projectId, featureId);
    const { hiddenEnvironments, onEnvironmentVisibilityChange } =
        useEnvironmentVisibility();
    const onSidebarClose = () => navigate(featurePath);
    usePageTitle(featureId);
    const { setLastViewed } = useLastViewedFlags();
    useEffect(() => {
        setLastViewed({ featureId, projectId });
    }, [featureId]);
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');

    const { setSplashSeen } = useSplashApi();
    const { splash } = useAuthSplash();
    const dragTooltipSplashId = 'strategy-drag-tooltip';
    const shouldShowStrategyDragTooltip = !splash?.[dragTooltipSplashId];
    const [showTooltip, setShowTooltip] = useState(false);

    if (!flagOverviewRedesign) {
        return <LegacyFleatureOverview />;
    }

    const toggleRun = (isOpen: boolean) => {
        setShowTooltip(shouldShowStrategyDragTooltip && isOpen);
    };

    return (
        <StyledContainer>
            <div>
                <FeatureOverviewMetaData
                    hiddenEnvironments={hiddenEnvironments}
                    onEnvironmentVisibilityChange={
                        onEnvironmentVisibilityChange
                    }
                />
            </div>
            <StyledMainContent>
                <Joyride
                    callback={({ action }) => {
                        if (action === 'close') {
                            setSplashSeen(dragTooltipSplashId);
                        }
                    }}
                    floaterProps={{
                        styles: {
                            arrow: {
                                color: '#201e42',
                                spread: 16,
                                length: 10,
                            },
                        },
                    }}
                    debug
                    run={showTooltip}
                    disableOverlay
                    disableScrolling
                    tooltipComponent={CustomTooltip}
                    steps={[
                        {
                            disableBeacon: true,
                            offset: 0,
                            target: '.strategy-drag-handle',
                            content: <></>,
                        },
                    ]}
                />
                <FeatureOverviewEnvironments
                    onEnvOpen={toggleRun}
                    hiddenEnvironments={hiddenEnvironments}
                />
            </StyledMainContent>
            <Routes>
                <Route
                    path='strategies/create'
                    element={
                        <SidebarModal
                            label='Create feature strategy'
                            onClose={onSidebarClose}
                            open
                        >
                            <FeatureStrategyCreate />
                        </SidebarModal>
                    }
                />
                <Route
                    path='strategies/edit'
                    element={
                        <SidebarModal
                            label='Edit feature strategy'
                            onClose={onSidebarClose}
                            open
                        >
                            <FeatureStrategyEdit />
                        </SidebarModal>
                    }
                />
            </Routes>
        </StyledContainer>
    );
};
