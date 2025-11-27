import type { ComponentProps, FC } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import type { NavigationMode } from './NavigationMode.tsx';
import {
    ExternalFullListItem,
    MenuListItem,
    SignOutItem,
} from './ListItems.tsx';
import { Box, List } from '@mui/material';
import { IconRenderer } from './IconRenderer.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNewAdminMenu } from 'hooks/useNewAdminMenu';
import { AdminMenuNavigation } from '../AdminMenu/AdminNavigationItems.tsx';
import { ConfigurationAccordion } from './ConfigurationAccordion.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { NewBadge } from 'component/layout/components/NewBadge/NewBadge.tsx';
import { useRoutes } from './useRoutes.ts';

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
    setMode: (mode: NavigationMode) => void;
    onClick: (activeItem: string) => void;
    activeItem?: string;
}> = ({ mode, setMode, onClick, activeItem }) => {
    const {
        routes: { primaryRoutes },
    } = useRoutes();
    const newRoute = primaryRoutes.find((route) => route.isNew);
    const PrimaryListItem = ({
        href,
        text,
        isNew,
    }: Pick<ComponentProps<typeof MenuListItem>, 'href' | 'text'> & {
        isNew?: boolean;
    }) => (
        <MenuListItem
            href={href}
            text={text}
            icon={<IconRenderer path={href} />}
            onClick={() => onClick(href)}
            selected={activeItem === href}
            mode={mode}
            badge={
                newRoute?.title.toLowerCase() === text.toLowerCase() ? (
                    <NewBadge />
                ) : null
            }
        />
    );

    const { isOss, isEnterprise } = useUiConfig();
    const impactMetricsEnabled = useUiFlag('impactMetrics');
    const globalChangeRequestListEnabled = useUiFlag('globalChangeRequestList');
    const showChangeRequestList =
        isEnterprise() && globalChangeRequestListEnabled;

    return (
        <List>
            <PrimaryListItem href='/personal' text='Dashboard' />
            <PrimaryListItem href='/projects' text='Projects' />
            <PrimaryListItem href='/search' text='Flags overview' />
            {showChangeRequestList ? (
                <PrimaryListItem
                    href='/change-requests'
                    text='Change requests'
                />
            ) : null}
            <PrimaryListItem href='/playground' text='Playground' />
            {!isOss() ? (
                <PrimaryListItem href='/insights' text='Analytics' />
            ) : null}
            {!isOss() && impactMetricsEnabled ? (
                <PrimaryListItem href='/impact-metrics' text='Impact Metrics' />
            ) : null}
            <ConfigurationAccordion
                mode={mode}
                setMode={setMode}
                activeItem={activeItem}
                onClick={onClick}
            />
        </List>
    );
};

export const AdminSettingsNavigation: FC<{
    onClick: (activeItem: string) => void;
    onSetFullMode: () => void;
    expanded: boolean;
    routes: INavigationMenuItem[];
    onExpandChange: (expanded: boolean) => void;
    activeItem: string;
    mode: NavigationMode;
}> = ({
    onClick,
    onSetFullMode,
    expanded,
    routes,
    onExpandChange,
    activeItem,
    mode,
}) => {
    const { showOnlyAdminMenu } = useNewAdminMenu();
    if (showOnlyAdminMenu) {
        return <AdminMenuNavigation onClick={() => onClick('/admin')} />;
    }

    const setFullModeOnClick = (activeItem: string) => {
        onSetFullMode();
        onClick(activeItem);
    };

    return <AdminSettingsLink mode={mode} onClick={setFullModeOnClick} />;
};

export const AdminSettingsLink: FC<{
    mode: NavigationMode;
    onClick: (activeItem: string) => void;
}> = ({ mode, onClick }) => (
    <Box>
        <List>
            <MenuListItem
                href='/admin'
                text='Admin settings'
                onClick={() => onClick('/admin')}
                mode={mode}
                icon={<IconRenderer path='/admin' />}
            />
        </List>
    </Box>
);
