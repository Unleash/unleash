import { useState, type FC, type MouseEvent } from 'react';
import {
    Box,
    Button,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tab,
    Tabs,
    styled,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { MetricView } from '../types';

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTabs = styled(Tabs)({
    flex: 1,
    minWidth: 0,
    '& .MuiTabs-flexContainer': {
        gap: 4,
    },
});

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightMedium,
    minHeight: theme.spacing(5.5),
    padding: theme.spacing(0.5, 1, 0.5, 2),
    '& .tab-actions': {
        opacity: 0.4,
        marginLeft: theme.spacing(0.5),
    },
    '&:hover .tab-actions, &.Mui-selected .tab-actions': {
        opacity: 1,
    },
}));

const StyledTabLabel = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
});

const StyledNewButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
}));

export type ViewSwitcherProps = {
    views: MetricView[];
    activeViewId: string | null;
    onSelect: (id: string) => void;
    onCreate: () => void;
    onEdit: (view: MetricView) => void;
    onDuplicate: (view: MetricView) => void;
    onDelete: (view: MetricView) => void;
};

export const ViewSwitcher: FC<ViewSwitcherProps> = ({
    views,
    activeViewId,
    onSelect,
    onCreate,
    onEdit,
    onDuplicate,
    onDelete,
}) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [menuViewId, setMenuViewId] = useState<string | null>(null);

    const openMenu = (event: MouseEvent<HTMLElement>, viewId: string) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
        setMenuViewId(viewId);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
        setMenuViewId(null);
    };

    const menuView = views.find((view) => view.id === menuViewId) ?? null;

    return (
        <StyledRoot>
            <StyledTabs
                value={activeViewId ?? false}
                onChange={(_, value) => onSelect(value as string)}
                variant='scrollable'
                scrollButtons='auto'
            >
                {views.map((view) => (
                    <StyledTab
                        key={view.id}
                        value={view.id}
                        label={
                            <StyledTabLabel>
                                <span>{view.title}</span>
                                <IconButton
                                    component='span'
                                    className='tab-actions'
                                    size='medium'
                                    aria-label={`${view.title} actions`}
                                    onClick={(event) =>
                                        openMenu(event, view.id)
                                    }
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </StyledTabLabel>
                        }
                    />
                ))}
            </StyledTabs>
            <StyledNewButton
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={onCreate}
            >
                New view
            </StyledNewButton>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
            >
                <MenuItem
                    onClick={() => {
                        if (menuView) onEdit(menuView);
                        closeMenu();
                    }}
                >
                    <ListItemIcon>
                        <EditOutlinedIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuView) onDuplicate(menuView);
                        closeMenu();
                    }}
                >
                    <ListItemIcon>
                        <ContentCopyOutlinedIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Duplicate</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuView) onDelete(menuView);
                        closeMenu();
                    }}
                >
                    <ListItemIcon>
                        <DeleteOutlineOutlinedIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </StyledRoot>
    );
};
