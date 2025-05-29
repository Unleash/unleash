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
    const [temporarilyExpanded, setTemporarilyExpanded] = useState(false);
    const { routes } = useRoutes();
    const subRoutes = routes.mainNavRoutes;
    const hasActiveItem = Boolean(
        activeItem && subRoutes.some((route) => route.path === activeItem),
    );

    useEffect(() => {
        if (mode === 'mini') {
            setTemporarilyExpanded(false);
        }
    }, [mode]);

    const onExpandChange = () => {
        changeExpanded('configure', !expanded.includes('configure'));

        if (temporarilyExpanded) {
            setTemporarilyExpanded(false);
            setMode('mini');
        }
        if (mode === 'mini') {
            setTemporarilyExpanded(true);
            setMode('full');
        }
    };

    const onItemClick = () => {
        if (temporarilyExpanded) {
            setTemporarilyExpanded(false);
            setMode('mini');
        }
        onClick?.();
    };

    return (
        <MenuListAccordion
            title='Configure'
            expanded={
                (expanded.includes('configure') || temporarilyExpanded) &&
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
