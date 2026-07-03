import type { ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import UnleashLogoWhite from 'assets/img/logoWithWhiteText.svg?react';
import { PageContent } from 'component/common/PageContent/PageContent.tsx';
import { PageHeader } from 'component/common/PageHeader/PageHeader.tsx';

const NAV_ITEMS = [
    { label: 'Projects', icon: DashboardOutlinedIcon, active: true },
    { label: 'Feature flags', icon: FlagOutlinedIcon },
    { label: 'Playground', icon: SportsEsportsOutlinedIcon },
    { label: 'Applications', icon: AppsOutlinedIcon },
    { label: 'Insights', icon: InsightsOutlinedIcon },
    { label: 'Configure', icon: SettingsOutlinedIcon },
];

const StyledRoot = styled(Box)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    background: theme.palette.background.application,
}));

const StyledSidebar = styled(Box)(({ theme }) => ({
    width: 232,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(2, 1.5),
    background: theme.palette.background.sidebar,
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

const StyledLogo = styled(UnleashLogoWhite)(({ theme }) => ({
    height: 28,
    width: 'auto',
    margin: theme.spacing(1, 1, 3),
}));

const StyledNavItem = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius,
    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
    fontWeight: active
        ? theme.typography.fontWeightBold
        : theme.typography.fontWeightRegular,
    '& svg': { fontSize: 20 },
}));

const StyledMain = styled(Box)({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
});

const StyledTopbar = styled(Box)(({ theme }) => ({
    height: 56,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
}));

const StyledAvatar = styled(Box)(({ theme }) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: theme.palette.secondary.border,
    color: theme.palette.secondary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledContent = styled(Box)({
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
});

interface IUnleashChromeMockProps {
    children: ReactNode;
    /** Short breadcrumb/title shown in the top bar. */
    title?: string;
}

/**
 * A faithful-but-lightweight mock of the Unleash app shell (dark purple sidebar
 * with the real logo, top bar, content area) so a demo framing can sit "inside"
 * the product without wiring the heavy real MainLayout/navigation.
 */
export const UnleashChromeMock = ({
    children,
    title = 'Projects',
}: IUnleashChromeMockProps) => (
    <StyledRoot>
        <StyledSidebar>
            <StyledLogo aria-label='Unleash logo' />
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                    <StyledNavItem key={item.label} active={item.active}>
                        <Icon />
                        <Typography variant='body2'>{item.label}</Typography>
                    </StyledNavItem>
                );
            })}
        </StyledSidebar>
        <StyledMain>
            <StyledTopbar>
                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                <StyledAvatar>AC</StyledAvatar>
            </StyledTopbar>
            <StyledContent>{children}</StyledContent>
        </StyledMain>
    </StyledRoot>
);

const StyledPage = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    maxWidth: 1100,
    margin: '0 auto',
}));

const StyledBreadcrumb = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledFlagRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledPill = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'on',
})<{ on?: boolean }>(({ theme, on }) => ({
    padding: theme.spacing(0.25, 1),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.fontSizes.smallerBody,
    background: on ? theme.palette.success.light : theme.palette.neutral.light,
    color: on ? theme.palette.success.dark : theme.palette.text.secondary,
}));

const MOCK_FLAGS = [
    { name: 'checkout-redesign', on: true },
    { name: 'search-suggestions', on: false },
    { name: 'dark-mode', on: true },
];

/**
 * A faux project "feature flags" page used as the backdrop / host for framings
 * that live inside a page (the same place the real ProjectOnboarding widget
 * sits). Renders an optional `topSlot` above the flag table.
 */
export const MockProjectContent = ({ topSlot }: { topSlot?: ReactNode }) => (
    <StyledPage>
        <Box>
            <StyledBreadcrumb>Projects / Default</StyledBreadcrumb>
            <PageHeader title='Default' />
        </Box>
        {topSlot}
        <PageContent header={<PageHeader title='Feature flags' />}>
            {MOCK_FLAGS.map((flag) => (
                <StyledFlagRow key={flag.name}>
                    <Typography>{flag.name}</Typography>
                    <StyledPill on={flag.on}>
                        {flag.on ? 'enabled' : 'disabled'}
                    </StyledPill>
                </StyledFlagRow>
            ))}
        </PageContent>
    </StyledPage>
);
