import { useState } from 'react';
import {
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

export const ReleasePlanTemplateCardMenu = ({
    template,
}: { template: IReleasePlanTemplate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    const closeMenu = () => {
        setIsMenuOpen(false);
        setAnchorEl(null);
    };

    const handleMenuClick = (event: React.SyntheticEvent) => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            setAnchorEl(event.currentTarget);
            setIsMenuOpen(true);
        }
    };

    return (
        <>
            <Tooltip title='Release plan template actions' arrow describeChild>
                <IconButton
                    id={template.id}
                    aria-controls={isMenuOpen ? 'actions-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={isMenuOpen ? 'true' : undefined}
                    onClick={handleMenuClick}
                    type='button'
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
            <Menu
                id='project-card-menu'
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClose={handleMenuClick}
            >
                <MenuItem
                    onClick={() => {
                        closeMenu();
                    }}
                >
                    <ListItemText>Edit template</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        closeMenu();
                    }}
                >
                    <ListItemText>Delete template </ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};
