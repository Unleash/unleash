import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PlaygroundIcon from '@mui/icons-material/AutoFixNormal';
import InsightsIcon from '@mui/icons-material/Insights';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import IntegrationsIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import EnvironmentsIcon from '@mui/icons-material/CloudOutlined';
import ContextFieldsIcon from '@mui/icons-material/AccountTreeOutlined';
import SegmentsIcon from '@mui/icons-material/DonutLargeOutlined';
import TagTypesIcon from '@mui/icons-material/LabelImportantOutlined';
import ApplicationsIcon from '@mui/icons-material/AppsOutlined';
import CustomStrategiesIcon from '@mui/icons-material/ExtensionOutlined';
import UsersIcon from '@mui/icons-material/GroupOutlined';
import ServiceAccountIcon from '@mui/icons-material/SmartToyOutlined';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import RoleIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ApiAccessIcon from '@mui/icons-material/KeyOutlined';
import SingleSignOnIcon from '@mui/icons-material/AssignmentOutlined';
import NetworkIcon from '@mui/icons-material/HubOutlined';
import MaintenanceIcon from '@mui/icons-material/BuildOutlined';
import BannersIcon from '@mui/icons-material/PhotoOutlined';
import InstanceStatsIcon from '@mui/icons-material/QueryStatsOutlined';
import LicenseIcon from '@mui/icons-material/ReceiptLongOutlined';
import InstancePrivacyIcon from '@mui/icons-material/ShieldOutlined';
import LoginHistoryIcon from '@mui/icons-material/HistoryOutlined';
import EventLogIcon from '@mui/icons-material/EventNoteOutlined';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';
import type { FC } from 'react';

export const StyledProjectIcon = styled(ProjectIcon)(({ theme }) => ({
    fill: theme.palette.neutral.main,
    stroke: theme.palette.neutral.main,
    // same as built-in icons
    width: theme.spacing(3),
    height: theme.spacing(3),
    fontSize: theme.spacing(3),
}));

const StyledListItem: FC<{ href: string; text: string }> = ({
    href,
    text,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton dense={true} component={Link} to={href}>
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </ListItem>
    );
};

export const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    pt: theme.spacing(3),
    pb: theme.spacing(3),
    minHeight: '95vh',
}));

export const NavigationSidebar = () => {
    return (
        <StyledBox>
            <List>
                <StyledListItem href='/projects' text='Projects'>
                    <StyledProjectIcon />
                </StyledListItem>
                <StyledListItem href='/search' text='Search'>
                    <SearchIcon />
                </StyledListItem>
                <StyledListItem href='/playground' text='Playground'>
                    <PlaygroundIcon />
                </StyledListItem>
                <StyledListItem href='/insights' text='Insights'>
                    <InsightsIcon />
                </StyledListItem>
            </List>
            <Accordion disableGutters={true} sx={{ boxShadow: 'none' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='configure-content'
                    id='configure-header'
                >
                    <Typography sx={{ fontWeight: 'bold', fontSize: 'small' }}>
                        Configure
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <List>
                        <StyledListItem
                            href='/integrations'
                            text='Integrations'
                        >
                            <IntegrationsIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/environments'
                            text='Environments'
                        >
                            <EnvironmentsIcon />
                        </StyledListItem>
                        <StyledListItem href='/context' text='Context fields'>
                            <ContextFieldsIcon />
                        </StyledListItem>
                        <StyledListItem href='/segments' text='Segments'>
                            <SegmentsIcon />
                        </StyledListItem>
                        <StyledListItem href='/tag-types' text='Tag types'>
                            <TagTypesIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/applications'
                            text='Applications'
                        >
                            <ApplicationsIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/strategies'
                            text='Custom strategies'
                        >
                            <CustomStrategiesIcon />
                        </StyledListItem>
                    </List>
                </AccordionDetails>
            </Accordion>
            <Accordion disableGutters={true} sx={{ boxShadow: 'none' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='admin-content'
                    id='admin-header'
                >
                    <Typography sx={{ fontWeight: 'bold', fontSize: 'small' }}>
                        Admin
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <List>
                        <StyledListItem href='/admin/users' text='Users'>
                            <UsersIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/admin/service-accounts'
                            text='Service accounts'
                        >
                            <ServiceAccountIcon />
                        </StyledListItem>
                        <StyledListItem href='/admin/groups' text='Groups'>
                            <GroupsIcon />
                        </StyledListItem>
                        <StyledListItem href='/admin/roles' text='Roles'>
                            <RoleIcon />
                        </StyledListItem>
                        <StyledListItem href='/admin/api' text='API Access'>
                            <ApiAccessIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/admin/auth'
                            text='Single sign-on'
                        >
                            <SingleSignOnIcon />
                        </StyledListItem>
                        <StyledListItem href='/admin/network' text='Network'>
                            <NetworkIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/admin/maintenance'
                            text='Maintenance'
                        >
                            <MaintenanceIcon />
                        </StyledListItem>
                        <StyledListItem href='/admin/banners' text='Banners'>
                            <BannersIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/admin/instance'
                            text='Instance stats'
                        >
                            <InstanceStatsIcon />
                        </StyledListItem>
                        <StyledListItem href='/admin/license' text='License'>
                            <LicenseIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/admin/instance-privacy'
                            text='Instance privacy'
                        >
                            <InstancePrivacyIcon />
                        </StyledListItem>
                        <StyledListItem
                            href='/admin/logins'
                            text='Login history'
                        >
                            <LoginHistoryIcon />
                        </StyledListItem>
                        <StyledListItem href='/history' text='Event log'>
                            <EventLogIcon />
                        </StyledListItem>
                    </List>
                </AccordionDetails>
            </Accordion>
        </StyledBox>
    );
};
