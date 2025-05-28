import { type FC, useEffect, useState } from 'react';
import { MenuListAccordion } from './ListItems.tsx';
import { useExpanded } from './useExpanded.ts';
import type { NavigationMode } from './NavigationMode.tsx';
import { IconRenderer } from './IconRenderer.tsx';
import { ConfigurationNavigationList } from './ConfigurationNavigationList.tsx';
import { useRoutes } from './useRoutes.ts';

type ConfigurationAccordionProps = {
    mode: NavigationMode;
    setMode;
    activeItem?: string;
    onClick?: () => void;
};

export const ConfigurationAccordion: FC<ConfigurationAccordionProps> = ({
    mode,
    setMode,
    activeItem,
    onClick,
}) => {
    const [expanded, changeExpanded] = useExpanded<'configure'>();
    const [tempExpanded, setTempExpanded] = useState(false);
    const { routes } = useRoutes();
    const subRoutes = routes.mainNavRoutes;
    const hasActiveItem = Boolean(
        activeItem && subRoutes.some((route) => route.path === activeItem),
    );

    useEffect(() => {
        if (mode === 'mini') {
            setTempExpanded(false);
        }
    }, [mode]);

    const onExpandChange = () => {
        changeExpanded('configure', !expanded.includes('configure'));

        if (tempExpanded) {
            setTempExpanded(false);
            setMode('mini');
        }
        if (mode === 'mini') {
            setTempExpanded(true);
            setMode('full');
        }
    };

    const onItemClick = () => {
        if (tempExpanded) {
            setTempExpanded(false);
            setMode('mini');
        }
        onClick?.();
    };

    return (
        <MenuListAccordion
            title='Configure'
            expanded={
                (expanded.includes('configure') || tempExpanded) &&
                mode === 'full'
            }
            onExpandChange={onExpandChange}
            mode={mode}
            icon={<IconRenderer path='Configure' />}
            active={hasActiveItem}
        >
            <ConfigurationNavigationList
                routes={subRoutes}
                mode={mode}
                onClick={onItemClick}
                activeItem={activeItem}
            />
        </MenuListAccordion>
    );
};
