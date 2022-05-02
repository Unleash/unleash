import { Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStyles } from '../NavigationLink/NavigationLink.styles';

interface INavigationMenuProps {
    options: any[];
    id: string;
    anchorEl: any;
    handleClose: () => void;
    style: Object;
}

export const NavigationMenu = ({
    options,
    id,
    handleClose,
    anchorEl,
    style,
}: INavigationMenuProps) => {
    const { classes: styles } = useStyles();

    return (
        <Menu
            id={id}
            onClose={handleClose}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            style={style}
        >
            {options.map(option => {
                return (
                    <MenuItem
                        key={option.path}
                        component={Link}
                        to={option.path}
                        onClick={handleClose}
                        classes={{ root: styles.navMenuLink }}
                    >
                        <span className={styles.menuItemBox} />
                        {option.title}
                    </MenuItem>
                );
            })}
        </Menu>
    );
};
