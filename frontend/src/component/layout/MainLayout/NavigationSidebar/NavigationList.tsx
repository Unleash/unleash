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
    const PrimaryListItem = ({
        href,
        text,
    }: Pick<ComponentProps<typeof MenuListItem>, 'href' | 'text'>) => (
        <MenuListItem
            href={href}
            text={text}
            icon={<IconRenderer path={href} />}
            onClick={() => onClick(href)}
            selected={activeItem === href}
            mode={mode}
        />
    );

    const { isOss, isEnterprise } = useUiConfig();
    const impactMetricsEnabled = useUiFlag('impactMetrics');
    const showChangeRequestList =
        isEnterprise() && useUiFlag('globalChangeRequestList');

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
                onClick={() => onClick('configure')}
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
