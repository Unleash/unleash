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
import { TemplateArchiveDialog } from '../TemplateArchiveDialog.tsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { RELEASE_PLAN_TEMPLATE_DELETE } from '@server/types/permissions';
import { useHasRootAccess } from 'hooks/useHasAccess';

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
}: {
    template: IReleasePlanTemplate;
}) => {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const { archiveReleasePlanTemplate } = useReleasePlanTemplatesApi();
    const { refetch } = useReleasePlanTemplates();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();
    const [archiveOpen, setArchiveOpen] = useState(false);
    const hasArchivePermission = useHasRootAccess(RELEASE_PLAN_TEMPLATE_DELETE);
    const archiveReleasePlan = useCallback(async () => {
        try {
            await archiveReleasePlanTemplate(template.id);
            refetch();
            setToastData({
                type: 'success',
                text: 'Release template archived',
            });

            trackEvent('release-management', {
                props: {
                    eventType: 'archive-template',
                    template: template.name,
                },
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    }, [setToastApiError, refetch, setToastData, archiveReleasePlanTemplate]);

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
            <Tooltip title='Release template actions' arrow describeChild>
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
                        to={`/release-templates/edit/${template.id}`}
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
                            setArchiveOpen(true);
                            handleClose();
                        }}
                        disabled={!hasArchivePermission}
                    >
                        <ListItemIcon>
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant='body2'>
                                Archive template
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                </MenuList>
            </StyledPopover>
            <TemplateArchiveDialog
                template={template}
                open={archiveOpen}
                setOpen={setArchiveOpen}
                onConfirm={archiveReleasePlan}
            />
        </StyledActions>
    );
};
