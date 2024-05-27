import { type FC, type ReactNode, useCallback } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import type { NavigationMode } from './NavigationMode';
import {
    ExternalFullListItem,
    FullListItem,
    MiniListItem,
    SignOutItem,
} from './ListItems';
import { List, styled, Tooltip, Typography } from '@mui/material';
import { IconRenderer, StyledProjectIcon } from './IconRenderer';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import SearchIcon from '@mui/icons-material/Search';
import PlaygroundIcon from '@mui/icons-material/AutoFixNormal';
import InsightsIcon from '@mui/icons-material/Insights';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledBadgeContainer = styled('div')(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    display: 'flex',
}));

const EnterprisePlanBadge = () => (
    <Tooltip title='This is an Enterprise feature'>
        <StyledBadgeContainer>
            <EnterpriseBadge />
        </StyledBadgeContainer>
    </Tooltip>
);

const useShowBadge = () => {
    const { isPro } = useUiConfig();

    const showBadge = useCallback(
        (mode?: INavigationMenuItem['menu']['mode']) => {
            return !!(
                isPro() &&
                !mode?.includes('pro') &&
                mode?.includes('enterprise')
            );
        },
        [isPro],
    );
    return showBadge;
};

export const ConfigureNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: NavigationMode;
    onClick?: () => void;
}> = ({ routes, mode, onClick }) => {
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            {routes.map((route) => (
                <DynamicListItem
                    key={route.title}
                    href={route.path}
                    text={route.title}
                    onClick={onClick}
                >
                    <IconRenderer path={route.path} />
                </DynamicListItem>
            ))}
        </List>
    );
};
export const AdminNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: NavigationMode;
    badge?: ReactNode;
    onClick?: () => void;
}> = ({ routes, mode, onClick, badge }) => {
    const showBadge = useShowBadge();
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            {routes.map((route) => (
                <DynamicListItem
                    key={route.title}
                    onClick={onClick}
                    href={route.path}
                    text={route.title}
                    badge={
                        showBadge(route?.menu?.mode) ? (
                            <EnterprisePlanBadge />
                        ) : null
                    }
                >
                    <IconRenderer path={route.path} />
                </DynamicListItem>
            ))}
        </List>
    );
};

export const OtherLinksList = () => {
    const { uiConfig } = useUiConfig();

    return (
        <List>
            {uiConfig.links.map((link) => (
                <ExternalFullListItem
                    href={link.href}
                    text={link.value}
                    key={link.value}
                >
                    <IconRenderer path={link.value} />
                </ExternalFullListItem>
            ))}
            <SignOutItem />
        </List>
    );
};

export const PrimaryNavigationList: FC<{
    mode: NavigationMode;
    onClick?: () => void;
}> = ({ mode, onClick }) => {
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            <DynamicListItem href='/projects' text='Projects' onClick={onClick}>
                <StyledProjectIcon />
            </DynamicListItem>
            <DynamicListItem href='/search' text='Search' onClick={onClick}>
                <SearchIcon />
            </DynamicListItem>
            <DynamicListItem
                href='/playground'
                text='Playground'
                onClick={onClick}
            >
                <PlaygroundIcon />
            </DynamicListItem>
            <DynamicListItem href='/insights' text='Insights' onClick={onClick}>
                <InsightsIcon />
            </DynamicListItem>
        </List>
    );
};

const AccordionHeader: FC = ({ children }) => {
    return (
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='configure-content'
            id='configure-header'
        >
            <Typography sx={{ fontWeight: 'bold', fontSize: 'small' }}>
                {children}
            </Typography>
        </AccordionSummary>
    );
};

export const SecondaryNavigation: FC<{
    expanded: boolean;
    onChange: (expanded: boolean) => void;
    mode: NavigationMode;
    routes: INavigationMenuItem[];
}> = ({ mode, expanded, onChange, routes, children }) => {
    return (
        <Accordion
            disableGutters={true}
            sx={{ boxShadow: 'none' }}
            expanded={expanded}
            onChange={(_, expand) => {
                onChange(expand);
            }}
        >
            {mode === 'full' && <AccordionHeader>{children}</AccordionHeader>}
            <AccordionDetails sx={{ p: 0 }}>
                <ConfigureNavigationList routes={routes} mode={mode} />
            </AccordionDetails>
        </Accordion>
    );
};
