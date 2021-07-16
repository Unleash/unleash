import { Popover, List } from '@material-ui/core';
import NavigationLink from '../NavigationLink/NavigationLink';

interface INavigationMenuProps {
    options: any[];
    id: string;
    anchorEl: any;
    handleClose: () => void;
}

const NavigationMenu = ({
    options,
    id,
    handleClose,
    anchorEl,
}: INavigationMenuProps) => {
    return (
        <Popover
            id={id}
            onClose={handleClose}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onMouseLeave={handleClose}
            style={{ top: '30px', left: '-90px' }}
        >
            <List>
                {options.map(option => {
                    return (
                        <NavigationLink
                            key={option.path}
                            handleClose={handleClose}
                            path={option.path}
                            text={option.title}
                        />
                    );
                })}
            </List>
        </Popover>
    );
};

export default NavigationMenu;
