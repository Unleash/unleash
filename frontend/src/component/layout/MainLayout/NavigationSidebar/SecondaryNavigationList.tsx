import type { FC } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import type { NavigationMode } from './NavigationMode.tsx';
import { FullListItem, MiniListItem } from './ListItems.tsx';
import { List } from '@mui/material';
import { IconRenderer } from './IconRenderer.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { useShowBadge } from 'component/layout/components/EnterprisePlanBadge/useShowBadge';
import { EnterprisePlanBadge } from 'component/layout/components/EnterprisePlanBadge/EnterprisePlanBadge';

export const SecondaryNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: NavigationMode;
    onClick: (activeItem: string) => void;
    activeItem?: string;
}> = ({ routes, mode, onClick, activeItem }) => {
    const showBadge = useShowBadge();
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;
    const sideMenuCleanup = useUiFlag('sideMenuCleanup');

    return (
        <List>
            {routes.map((route) => (
                <DynamicListItem
                    key={route.title}
                    onClick={() => onClick(route.path)}
                    href={route.path}
                    text={route.title}
                    selected={activeItem === route.path}
                    badge={
                        showBadge(route?.menu?.mode) ? (
                            <EnterprisePlanBadge />
                        ) : null
                    }
                >
                    {sideMenuCleanup ? (
                        <StopRoundedIcon fontSize='small' color='primary' />
                    ) : (
                        <IconRenderer path={route.path} />
                    )}
                </DynamicListItem>
            ))}
        </List>
    );
};
