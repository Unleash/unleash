import { useId, useState, type FC, type MouseEvent } from 'react';
import MoreVert from '@mui/icons-material/MoreVert';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import WatchLaterOutlined from '@mui/icons-material/WatchLaterOutlined';
import LibraryAddOutlined from '@mui/icons-material/LibraryAddOutlined';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import { Link } from 'react-router';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { useCheckProjectPermissions } from 'hooks/useHasAccess';
import type { FeatureSchema } from 'openapi';

type FeatureHeaderActionsKebabProps = {
    feature: Pick<FeatureSchema, 'project' | 'name' | 'favorite'>;
    onFavorite: () => void;
    openStaleDialog: () => void;
    openDeleteDialog: () => void;
};

export const FeatureHeaderActionsKebab: FC<FeatureHeaderActionsKebabProps> = ({
    feature,
    onFavorite,
    openStaleDialog,
    openDeleteDialog,
}) => {
    const checkAccess = useCheckProjectPermissions(feature.project);
    const canClone = checkAccess(CREATE_FEATURE);
    const canArchive = checkAccess(DELETE_FEATURE);
    const canToggleStale = checkAccess(UPDATE_FEATURE);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const buttonId = useId();
    const menuId = useId();

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                aria-label='Feature flag actions'
                id={buttonId}
                aria-controls={open ? menuId : undefined}
                aria-expanded={open}
                aria-haspopup='true'
                onClick={handleClick}
            >
                <MoreVert />
            </IconButton>
            <Menu
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                slotProps={{
                    list: {
                        'aria-labelledby': buttonId,
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        onFavorite();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        {feature.favorite ? <Star /> : <StarBorder />}
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>
                            {feature.favorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'}
                        </Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    component={Link}
                    nativeButton={false}
                    disabled={!canClone}
                    to={`/projects/${feature.project}/features/${feature.name}/copy`}
                >
                    <ListItemIcon>
                        <LibraryAddOutlined />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>Clone</Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!canArchive}
                    onClick={() => {
                        openDeleteDialog();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <ArchiveOutlined />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>
                            Archive feature flag
                        </Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!canToggleStale}
                    onClick={() => {
                        openStaleDialog();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <WatchLaterOutlined />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant='body2'>
                            Toggle stale state
                        </Typography>
                    </ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};
