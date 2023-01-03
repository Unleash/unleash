import { Menu, MenuItem, styled } from '@mui/material';
import { Link } from 'react-router-dom';

interface INavigationMenuProps {
    options: any[];
    id: string;
    anchorEl: any;
    handleClose: () => void;
    style: Object;
}

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    alignItems: 'center',
    display: 'flex',
    color: 'inherit',
    height: '100%',
    width: '100%',
    '&&': {
        // Override MenuItem's built-in padding.
        padding: theme.spacing(1, 2),
    },
}));

const StyledSpan = styled('span')(({ theme }) => ({
    width: '12.5px',
    height: '12.5px',
    display: 'block',
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(2),
    borderRadius: '2px',
}));

export const NavigationMenu = ({
    options,
    id,
    handleClose,
    anchorEl,
    style,
}: INavigationMenuProps) => {
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
                        component={StyledLink}
                        to={option.path}
                        onClick={handleClose}
                    >
                        <StyledSpan />
                        {option.title}
                    </MenuItem>
                );
            })}
        </Menu>
    );
};
