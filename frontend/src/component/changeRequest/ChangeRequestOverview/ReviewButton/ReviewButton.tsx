import React, { FC, useContext } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';

import {
    Grow,
    Paper,
    Popper,
    MenuItem,
    MenuList,
    ClickAwayListener,
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { APPROVE_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import AccessContext from 'contexts/AccessContext';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';

export const ReviewButton: FC<{ disabled: boolean }> = ({ disabled }) => {
    const { isAdmin } = useContext(AccessContext);
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { user } = useAuthUser();
    const { refetchChangeRequest, data } = useChangeRequest(projectId, id);
    const { refetch: refetchChangeRequestOpen } =
        usePendingChangeRequests(projectId);
    const { setToastApiError, setToastData } = useToast();

    const { changeState } = useChangeRequestApi();

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const onApprove = async () => {
        try {
            await changeState(projectId, Number(id), {
                state: 'Approved',
            });
            refetchChangeRequest();
            refetchChangeRequestOpen();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Changes approved',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onToggle = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const onClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <PermissionButton
                variant="contained"
                disabled={
                    disabled || (data?.createdBy.id === user?.id && !isAdmin)
                }
                aria-controls={open ? 'review-options-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="review changes"
                aria-haspopup="menu"
                onClick={onToggle}
                ref={anchorRef}
                endIcon={<ArrowDropDownIcon />}
                permission={APPROVE_CHANGE_REQUEST}
                projectId={projectId}
                environmentId={data?.environment}
            >
                Review changes
            </PermissionButton>
            <Popper
                sx={{
                    zIndex: 1,
                }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom'
                                    ? 'center top'
                                    : 'center bottom',
                        }}
                    >
                        <Paper className="dropdown-outline">
                            <ClickAwayListener onClickAway={onClose}>
                                <MenuList
                                    id="review-options-menu"
                                    autoFocusItem
                                >
                                    <MenuItem onClick={onApprove}>
                                        Approve changes
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
};
