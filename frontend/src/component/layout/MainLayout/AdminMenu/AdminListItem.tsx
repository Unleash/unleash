import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Theme } from '@mui/material/styles/createTheme';

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    m: 0,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
    minHeight: '0px',
    '.MuiAccordionSummary-content': { margin: 0 },
    '&>.MuiAccordionSummary-content.MuiAccordionSummary-content': {
        margin: '0',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
    },
});

const subListItemButtonStyle = (theme: Theme) => ({
    paddingLeft: theme.spacing(4),
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    m: 0,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});

const CappedText = styled(Typography)({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
});

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(4),
    margin: theme.spacing(0.25, 0),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    paddingTop: theme.spacing(0),
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

interface IMenuGroupProps {
    title: string;
    children: ReactNode;
    icon: ReactNode;
    activeIcon: ReactNode;
    isActiveMenu: boolean;
    staticExpanded?: true | undefined;
}

export const MenuGroup = ({
    title,
    children,
    icon,
    activeIcon,
    isActiveMenu,
    staticExpanded,
}: IMenuGroupProps) => {
    return (
        <StyledAccordion
            disableGutters={true}
            expanded={staticExpanded}
            sx={{
                boxShadow: 'none',
                '&:before': {
                    display: 'none',
                },
            }}
        >
            <StyledAccordionSummary
                expandIcon={staticExpanded ? null : <ExpandMoreIcon />}
                aria-controls='configure-content'
                id='configure-header'
                sx={listItemButtonStyle}
            >
                <StyledListItemIcon>
                    {isActiveMenu ? activeIcon : icon}
                </StyledListItemIcon>
                <StyledListItemText>
                    <CappedText
                        sx={{ fontWeight: isActiveMenu ? 'bold' : 'normal' }}
                    >
                        {title}
                    </CappedText>
                </StyledListItemText>
            </StyledAccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
        </StyledAccordion>
    );
};

export const AdminListItem: FC<{
    href: string;
    text: string;
    badge?: ReactNode;
    selected?: boolean;
    children?: React.ReactNode;
    onClick: () => void;
}> = ({ href, text, badge, selected, children, onClick }) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={listItemButtonStyle}
                selected={selected}
                onClick={onClick}
            >
                <StyledListItemIcon>{children}</StyledListItemIcon>
                <StyledListItemText>
                    <CappedText>{text}</CappedText>
                </StyledListItemText>
                {badge}
            </ListItemButton>
        </ListItem>
    );
};

export const AdminSubListItem: FC<{
    href: string;
    text: string;
    badge?: ReactNode;
    selected?: boolean;
    children?: React.ReactNode;
    onClick: () => void;
}> = ({ href, text, badge, selected, children, onClick }) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                dense={true}
                component={Link}
                to={href}
                sx={subListItemButtonStyle}
                selected={selected}
                onClick={onClick}
            >
                <StyledListItemIcon>{children}</StyledListItemIcon>
                <StyledListItemText>
                    <CappedText>{text}</CappedText>
                </StyledListItemText>
                {badge}
            </ListItemButton>
        </ListItem>
    );
};
