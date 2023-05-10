import React, { FC, useState } from 'react';
import {
    IChange,
    IChangeRequest,
    IChangeRequestAddStrategy,
    IChangeRequestUpdateStrategy,
} from '../../../changeRequest.types';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { changesCount } from '../../../changesCount';
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
import { Delete, Edit, MoreVert } from '@mui/icons-material';
import { EditChange } from './EditChange';

const useShowActions = (changeRequest: IChangeRequest, change: IChange) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(
        changeRequest.project
    );
    const allowChangeRequestActions = isChangeRequestConfigured(
        changeRequest.environment
    );
    const isPending = !['Cancelled', 'Applied'].includes(changeRequest.state);

    const { user } = useAuthUser();
    const isAuthor = user?.id === changeRequest.createdBy.id;

    const showActions = allowChangeRequestActions && isPending && isAuthor;

    const showEdit =
        showActions &&
        ['addStrategy', 'updateStrategy'].includes(change.action);

    const showDiscard = showActions && changesCount(changeRequest) > 1;

    return { showEdit, showDiscard };
};

const StyledPopover = styled(Popover)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(1, 1.5),
}));

export const ChangeActions: FC<{
    changeRequest: IChangeRequest;
    feature: string;
    change: IChange;
    onRefetch?: () => void;
}> = ({ changeRequest, feature, change, onRefetch }) => {
    const { showDiscard, showEdit } = useShowActions(changeRequest, change);
    const { discardChange } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

    const [editOpen, setEditOpen] = useState(false);

    const id = `cr-${change.id}-actions`;
    const menuId = `${id}-menu`;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onEdit = () => {
        setEditOpen(true);
    };

    const onDiscard = async () => {
        try {
            handleClose();
            await discardChange(
                changeRequest.project,
                changeRequest.id,
                change.id
            );
            setToastData({
                title: 'Change discarded from change request draft.',
                type: 'success',
            });
            onRefetch?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <ConditionallyRender
            condition={showEdit || showDiscard}
            show={
                <>
                    <Tooltip title="Change request actions" arrow describeChild>
                        <IconButton
                            id={id}
                            aria-controls={open ? menuId : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                            type="button"
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
                            <ConditionallyRender
                                condition={showEdit}
                                show={
                                    <MenuItem onClick={onEdit}>
                                        <ListItemIcon>
                                            <Edit />
                                        </ListItemIcon>
                                        <ListItemText>
                                            <Typography variant="body2">
                                                Edit change
                                            </Typography>
                                        </ListItemText>
                                        <EditChange
                                            changeRequestId={changeRequest.id}
                                            featureId={feature}
                                            change={
                                                change as
                                                    | IChangeRequestAddStrategy
                                                    | IChangeRequestUpdateStrategy
                                            }
                                            environment={
                                                changeRequest.environment
                                            }
                                            open={editOpen}
                                            onSubmit={() => {
                                                setEditOpen(false);
                                                onRefetch?.();
                                            }}
                                            onClose={() => {
                                                setEditOpen(false);
                                            }}
                                        />
                                    </MenuItem>
                                }
                            />

                            <ConditionallyRender
                                condition={showDiscard}
                                show={
                                    <MenuItem
                                        onClick={() => {
                                            onDiscard();
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Delete />
                                        </ListItemIcon>
                                        <ListItemText>
                                            <Typography variant="body2">
                                                Discard change
                                            </Typography>
                                        </ListItemText>
                                    </MenuItem>
                                }
                            />
                        </MenuList>
                    </StyledPopover>
                </>
            }
        />
    );
};
