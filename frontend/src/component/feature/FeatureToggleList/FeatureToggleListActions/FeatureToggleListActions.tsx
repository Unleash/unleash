import { type FC, useState } from 'react';
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
import Add from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { useCreateFeaturePath } from 'component/feature/CreateFeatureButton/useCreateFeaturePath';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import IosShare from '@mui/icons-material/IosShare';

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

interface IFeatureFlagListActions {
    onExportClick: () => void;
}

export const FeatureToggleListActions: FC<IFeatureFlagListActions> = ({
    onExportClick,
}: IFeatureFlagListActions) => {
    const { trackEvent } = usePlausibleTracker();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const featuresExportImport = useUiFlag('featuresExportImport');
    const createFeature = useCreateFeaturePath({
        query: '',
        project: 'default',
    });

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        trackEvent('search-feature-buttons', {
            props: {
                action: 'options',
            },
        });
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const id = `feature-flag-list-actions`;
    const menuId = `${id}-menu`;

    return (
        <StyledActions
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Tooltip title='Options' arrow describeChild>
                <IconButton
                    id={id}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup='true'
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    type='button'
                >
                    <MoreVert />
                </IconButton>
            </Tooltip>
            <StyledPopover
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top',
                }}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom',
                }}
                disableScrollLock={true}
            >
                <MenuList aria-labelledby={id}>
                    <PermissionHOC permission={CREATE_FEATURE}>
                        {({ hasAccess }) => (
                            <MenuItem
                                component={Link}
                                disabled={!hasAccess}
                                to={createFeature!.path}
                                onClick={() => {
                                    handleClose();
                                    trackEvent('search-feature-buttons', {
                                        props: {
                                            action: 'new-feature',
                                        },
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <Add />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant='body2'>
                                        New feature flag
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        )}
                    </PermissionHOC>
                    <ConditionallyRender
                        condition={featuresExportImport}
                        show={
                            <MenuItem
                                onClick={() => {
                                    onExportClick();
                                    handleClose();
                                    trackEvent('search-feature-buttons', {
                                        props: {
                                            action: 'export',
                                        },
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <IosShare />
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant='body2'>
                                        Export
                                    </Typography>
                                </ListItemText>
                            </MenuItem>
                        }
                    />
                </MenuList>
            </StyledPopover>
        </StyledActions>
    );
};
