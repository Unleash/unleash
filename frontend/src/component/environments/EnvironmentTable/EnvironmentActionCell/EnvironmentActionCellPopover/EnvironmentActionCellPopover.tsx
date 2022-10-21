import {
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { IEnvironment } from 'interfaces/environments';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import {
    ADMIN,
    DELETE_ENVIRONMENT,
    UPDATE_ENVIRONMENT,
} from 'component/providers/AccessProvider/permissions';
import { Delete, Edit, AddToPhotos as CopyIcon } from '@mui/icons-material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledMenuList = styled(MenuList)(({ theme }) => ({
    padding: theme.spacing(1),
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
}));

interface IEnvironmentActionCellPopoverProps {
    environment: IEnvironment;
    onEdit: () => void;
    onClone: () => void;
    onDelete: () => void;
}

export const EnvironmentActionCellPopover = ({
    environment,
    onEdit,
    onClone,
    onDelete,
}: IEnvironmentActionCellPopoverProps) => {
    const { uiConfig } = useUiConfig();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const id = `environment-${environment.name}-actions`;
    const menuId = `${id}-menu`;

    return (
        <>
            <Tooltip title="Environment actions" arrow describeChild>
                <IconButton
                    id={id}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type="button"
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
            <Popover
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
            >
                <StyledMenuList aria-labelledby={id}>
                    <PermissionHOC permission={UPDATE_ENVIRONMENT}>
                        {({ hasAccess }) => (
                            <StyledMenuItem
                                onClick={() => {
                                    onEdit();
                                    handleClose();
                                }}
                                disabled={!hasAccess || environment.protected}
                            >
                                <ListItemIcon>
                                    <Edit />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant="body2">
                                        Edit
                                    </Typography>
                                </ListItemText>
                            </StyledMenuItem>
                        )}
                    </PermissionHOC>
                    <ConditionallyRender
                        // condition={Boolean(uiConfig.flags.cloneEnvironment)}
                        condition={true} // TODO: Change this back
                        show={
                            <PermissionHOC permission={ADMIN}>
                                {({ hasAccess }) => (
                                    <StyledMenuItem
                                        onClick={() => {
                                            onClone();
                                            handleClose();
                                        }}
                                        disabled={!hasAccess}
                                    >
                                        <ListItemIcon>
                                            <CopyIcon />
                                        </ListItemIcon>
                                        <ListItemText>
                                            <Typography variant="body2">
                                                Clone
                                            </Typography>
                                        </ListItemText>
                                    </StyledMenuItem>
                                )}
                            </PermissionHOC>
                        }
                    />
                    <PermissionHOC permission={DELETE_ENVIRONMENT}>
                        {({ hasAccess }) => (
                            <StyledMenuItem
                                onClick={() => {
                                    onDelete();
                                    handleClose();
                                }}
                                disabled={!hasAccess || environment.protected}
                            >
                                <ListItemIcon>
                                    <Delete />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant="body2">
                                        Delete
                                    </Typography>
                                </ListItemText>
                            </StyledMenuItem>
                        )}
                    </PermissionHOC>
                </StyledMenuList>
            </Popover>
        </>
    );
};
