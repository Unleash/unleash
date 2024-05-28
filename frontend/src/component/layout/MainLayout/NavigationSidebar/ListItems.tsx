import type { FC, ReactNode } from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { basePath } from 'utils/formatPath';
import SignOutIcon from '@mui/icons-material/ExitToApp';
import type { Theme } from '@mui/material/styles/createTheme';

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});

const CappedText = styled(Typography)({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '160px',
});

export const FullListItem: FC<{
    href: string;
    text: string;
    badge?: ReactNode;
    onClick: () => void;
    selected?: boolean;
}> = ({ href, text, badge, onClick, selected, children }) => {
    return (
        <ListItem disablePadding onClick={onClick}>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
                selected={selected}
            >
                <ListItemIcon sx={(theme) => ({ minWidth: theme.spacing(4) })}>
                    {children}
                </ListItemIcon>
                <ListItemText>
                    <CappedText>{text}</CappedText>
                </ListItemText>
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

export const MiniListItem: FC<{
    href: string;
    text: string;
    selected?: boolean;
    onClick: () => void;
}> = ({ href, text, selected, onClick, children }) => {
    return (
        <ListItem disablePadding onClick={onClick}>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
                selected={selected}
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
