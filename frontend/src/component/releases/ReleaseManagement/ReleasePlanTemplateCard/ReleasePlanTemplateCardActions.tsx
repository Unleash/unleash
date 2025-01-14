import { useCallback, useState } from 'react';
import {
    IconButton,
    Tooltip,
    MenuItem,
    ListItemText,
    styled,
    Popover,
    MenuList,
    ListItemIcon,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useReleasePlanTemplatesApi } from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { TemplateDeleteDialog } from '../TemplateDeleteDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const StyledActions = styled('div')(({ theme }) => ({
    margin: theme.spacing(-1),
    marginLeft: theme.spacing(-0.5),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

export const ReleasePlanTemplateCardActions = ({
    template,
}: { template: IReleasePlanTemplate }) => {
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
                text: 'Release plan template deleted',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    }, [setToastApiError, refetch, setToastData, deleteReleasePlanTemplate]);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const id = `release-plan-template-${template.id}-actions`;
    const menuId = `${id}-menu`;

    return (
        <StyledActions
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Tooltip title='Release plan template actions' arrow describeChild>
                <IconButton
                    id={id}
                    aria-controls={open ? 'actions-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type='button'
                    size='small'
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
            <StyledPopover
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
            >
                <MenuList aria-labelledby={id}>
                    <MenuItem
                        onClick={handleClose}
                        component={Link}
                        to={`/release-management/edit/${template.id}`}
                    >
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant='body2'>
                                Edit template
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setDeleteOpen(true);
                            handleClose();
                        }}
                    >
                        <ListItemIcon>
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant='body2'>
                                Delete template
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                </MenuList>
            </StyledPopover>
            <TemplateDeleteDialog
                template={template}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={deleteReleasePlan}
            />
        </StyledActions>
    );
};
