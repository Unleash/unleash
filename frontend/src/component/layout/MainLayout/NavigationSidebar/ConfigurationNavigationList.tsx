import type { FC } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import type { NavigationMode } from './NavigationMode.ts';
import { MenuListItem } from './ListItems.tsx';
import { List } from '@mui/material';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { useShowBadge } from 'component/layout/components/EnterprisePlanBadge/useShowBadge';
import { EnterprisePlanBadge } from 'component/layout/components/EnterprisePlanBadge/EnterprisePlanBadge.tsx';
import { NewBadge } from 'component/layout/components/NewBadge/NewBadge.tsx';

export const ConfigurationNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: NavigationMode;
    onClick: (activeItem: string) => void;
    activeItem?: string;
}> = ({ routes, mode, onClick, activeItem }) => {
    const showBadge = useShowBadge();

    return (
        <List>
            {routes.map((route) => (
                <MenuListItem
                    key={route.title}
                    onClick={() => onClick(route.path)}
                    href={route.path}
                    text={route.title}
                    selected={activeItem === route.path}
                    badge={
                        showBadge(route?.menu?.mode) ? (
                            <EnterprisePlanBadge />
                        ) : route.isNew ? (
                            <NewBadge />
                        ) : null
                    }
                    mode={mode}
                    icon={<StopRoundedIcon fontSize='small' color='primary' />}
                    secondary={true}
                />
            ))}
        </List>
    );
};
