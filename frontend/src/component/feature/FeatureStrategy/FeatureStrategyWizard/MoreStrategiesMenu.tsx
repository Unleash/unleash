import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, ListSubheader, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import type { IStrategy } from 'interfaces/strategy';
import { formatStrategyName } from 'utils/strategyNames';

interface IMoreStrategiesMenuProps {
    onSelect: (strategy: IStrategy) => void;
}

export const MoreStrategiesMenu = ({ onSelect }: IMoreStrategiesMenuProps) => {
    const { strategies } = useStrategies();
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const activeStrategies = strategies.filter(
        (strategy) => !strategy.deprecated,
    );

    const groups = [
        {
            title: 'Advanced strategies',
            strategies: activeStrategies.filter(
                (strategy) => strategy.advanced && !strategy.editable,
            ),
        },
        {
            title: 'Custom strategies',
            strategies: activeStrategies.filter(
                (strategy) => strategy.editable,
            ),
        },
    ].filter((group) => group.strategies.length > 0);

    if (groups.length === 0) {
        return null;
    }

    const select = (strategy: IStrategy) => {
        setMenuAnchor(null);
        onSelect(strategy);
    };

    return (
        <>
            <Button
                variant='text'
                size='medium'
                endIcon={<ExpandMoreIcon />}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                aria-haspopup='menu'
                aria-expanded={Boolean(menuAnchor)}
                sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
                More strategies
            </Button>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                {groups.flatMap((group) => [
                    <ListSubheader key={group.title}>
                        {group.title}
                    </ListSubheader>,
                    ...group.strategies.map((strategy) => (
                        <MenuItem
                            key={strategy.name}
                            onClick={() => select(strategy)}
                        >
                            {strategy.displayName ||
                                formatStrategyName(strategy.name)}
                        </MenuItem>
                    )),
                ])}
            </Menu>
        </>
    );
};
