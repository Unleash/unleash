import type { FC, ReactNode } from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { basePath } from '../../../../utils/formatPath';
import SignOutIcon from '@mui/icons-material/ExitToApp';
import type { Theme } from '@mui/material/styles/createTheme';

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&:hover': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});
export const FullListItem: FC<{
    href: string;
    text: string;
    badge?: ReactNode;
    onClick?: () => void;
}> = ({ href, text, badge, onClick, children }) => {
    return (
        <ListItem disablePadding onClick={onClick}>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
            >
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText sx={{ whiteSpace: 'nowrap' }} primary={text} />
                {badge}
            </ListItemButton>
        </ListItem>
    );
};
export const ExternalFullListItem: FC<{ href: string; text: string }> = ({
    href,
    text,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                rel='noopener noreferrer'
                target='_blank'
            >
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </ListItem>
    );
};
export const SignOutItem = () => {
    return (
        <form method='POST' action={`${basePath}/logout`}>
            <ListItem disablePadding>
                <ListItemButton dense={true} component='button' type='submit'>
                    <ListItemIcon
                        sx={(theme) => ({ minWidth: theme.spacing(4) })}
                    >
                        <SignOutIcon />
                    </ListItemIcon>
                    <ListItemText primary='Sign out' />
                </ListItemButton>
            </ListItem>
        </form>
    );
};
export const MiniListItem: FC<{ href: string; text: string }> = ({
    href,
    text,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
            >
                <Tooltip title={text} placement='right'>
                    <ListItemIcon
                        sx={(theme) => ({ minWidth: theme.spacing(4) })}
                    >
                        {children}
                    </ListItemIcon>
                </Tooltip>
            </ListItemButton>
        </ListItem>
    );
};
