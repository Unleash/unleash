import { useCallback, useState } from 'react';
import {
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useReleasePlanTemplatesApi } from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { TemplateDeleteDialog } from './TemplateDeleteDialog';

export const ReleasePlanTemplateCardMenu = ({
    template,
    onClick,
}: { template: IReleasePlanTemplate; onClick: () => void }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const { deleteReleasePlanTemplate } = useReleasePlanTemplatesApi();
    const { refetch } = useReleasePlanTemplates();
    const { setToastData, setToastApiError } = useToast();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteReleasePlan = useCallback(async () => {
        try {
            await deleteReleasePlanTemplate(template.id);
            refetch();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Release plan template deleted',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    }, [setToastApiError, refetch, setToastData, deleteReleasePlanTemplate]);

    const closeMenu = () => {
        setIsMenuOpen(false);
        setAnchorEl(null);
    };

    const handleMenuClick = (event: React.SyntheticEvent) => {
        event.stopPropagation();
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
                        onClick();
                    }}
                >
                    <ListItemText>Edit template</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setDeleteOpen(true);
                        closeMenu();
                    }}
                >
                    <ListItemText>Delete template</ListItemText>
                </MenuItem>
            </Menu>
            <TemplateDeleteDialog
                template={template}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={deleteReleasePlan}
            />
        </>
    );
};
