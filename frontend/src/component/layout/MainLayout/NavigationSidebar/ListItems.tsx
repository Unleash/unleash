import type { FC, ReactNode } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { NavigationMode } from './NavigationMode.tsx';

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});

const CappedText = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'bold',
})<{
    bold?: boolean;
}>(({ theme, bold }) => ({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    fontWeight: bold
        ? theme.typography.fontWeightBold
        : theme.typography.fontWeightRegular,
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(4),
    margin: theme.spacing(0.25, 0),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
}));

export const ExternalFullListItem: FC<{
    href: string;
    text: string;
    children?: ReactNode;
}> = ({ href, text, children }) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
                rel='noopener noreferrer'
                target='_blank'
            >
                <StyledListItemIcon>{children}</StyledListItemIcon>
                <StyledListItemText>
                    <CappedText>{text}</CappedText>
                </StyledListItemText>
            </ListItemButton>
        </ListItem>
    );
};

export const SignOutItem = () => {
    return (
        <form method='POST' action={`${basePath}/logout`}>
            <ListItem disablePadding>
                <ListItemButton
                    dense={true}
                    component='button'
                    type='submit'
                    sx={listItemButtonStyle}
                >
                    <StyledListItemIcon>
                        <SignOutIcon />
                    </StyledListItemIcon>
                    <StyledListItemText>
                        <CappedText>Sign out</CappedText>
                    </StyledListItemText>
                </ListItemButton>
            </ListItem>
        </form>
    );
};

export const MenuListItem: FC<{
    href: string;
    text: string;
    selected?: boolean;
    badge?: ReactNode;
    onClick: () => void;
    icon?: ReactNode;
    children?: ReactNode;
    mode?: NavigationMode;
    secondary?: boolean;
}> = ({
    href,
    text,
    selected,
    onClick,
    icon,
    mode = 'full',
    badge,
    children,
    secondary,
}) => {
    return (
        <ListItem disablePadding onClick={onClick}>
            <ListItemButton
                dense
                component={Link}
                to={href}
                sx={(theme) => ({
                    ...listItemButtonStyle(theme),
                    ...(mode === 'full' &&
                        secondary && {
                            paddingLeft: theme.spacing(4),
                        }),
                })}
                selected={selected}
            >
                {mode === 'mini' ? (
                    <Tooltip title={text} placement='right'>
                        <StyledListItemIcon>{icon}</StyledListItemIcon>
                    </Tooltip>
                ) : (
                    <>
                        <StyledListItemIcon>{icon}</StyledListItemIcon>
                        <StyledListItemText>
                            <CappedText>{text}</CappedText>
                        </StyledListItemText>
                        {badge}
                    </>
                )}
            </ListItemButton>
            {children}
        </ListItem>
    );
};

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    flexGrow: 1,
    '.MuiAccordionSummary-root': {
        minHeight: 'auto',
        borderRadius: theme.spacing(1),
        borderLeft: `${theme.spacing(0.5)} solid transparent`,
        margin: 0,
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        '.MuiAccordionSummary-content': { margin: 0 },
        '&>.MuiAccordionSummary-content.MuiAccordionSummary-content': {
            margin: '0',
            alignItems: 'center',
        },
    },
    '.MuiAccordionSummary-content': {
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    '.MuiAccordionSummary-expandIconWrapper': {
        position: 'absolute',
        right: theme.spacing(1),
    },
}));

export const MenuListAccordion: FC<{
    title: string;
    expanded: boolean;
    onExpandChange: (expanded: boolean) => void;
    children?: ReactNode;
    mode?: NavigationMode;
    icon?: ReactNode;
    active?: boolean;
}> = ({ title, expanded, mode, icon, onExpandChange, children, active }) => {
    return (
        <ListItem disablePadding sx={{ display: 'flex' }}>
            <StyledAccordion
                disableGutters={true}
                sx={{
                    boxShadow: 'none',
                    '&:before': {
                        display: 'none',
                    },
                }}
                expanded={expanded}
                onChange={(_, expand) => {
                    onExpandChange(expand);
                }}
            >
                <AccordionSummary
                    sx={{ padding: 0 }}
                    expandIcon={mode === 'full' ? <ExpandMoreIcon /> : null}
                >
                    {/* biome-ignore lint/a11y/useValidAriaRole: remove button role - accordion already has it */}
                    <ListItemButton
                        dense
                        sx={listItemButtonStyle}
                        selected={active && mode === 'mini'}
                        disableRipple
                        tabIndex={-1}
                        component='span'
                        role={undefined}
                    >
                        {mode === 'mini' ? (
                            <Tooltip title={title} placement='right'>
                                <StyledListItemIcon>{icon}</StyledListItemIcon>
                            </Tooltip>
                        ) : (
                            <>
                                <StyledListItemIcon>{icon}</StyledListItemIcon>
                                <StyledListItemText>
                                    <CappedText bold={active}>
                                        {title}
                                    </CappedText>
                                </StyledListItemText>
                            </>
                        )}
                    </ListItemButton>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
            </StyledAccordion>
        </ListItem>
    );
};
