import React, { FC, useContext } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';

import {
    ClickAwayListener,
    Grow,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Popper,
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { APPROVE_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import AccessContext from 'contexts/AccessContext';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import CheckBox from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';

export const ReviewButton: FC<{ disabled: boolean }> = ({ disabled }) => {
    const { uiConfig } = useUiConfig();
export const ReviewButton: FC<{
    disabled: boolean;
    onReject: () => void;
    onApprove: () => void;
}> = ({ disabled, onReject, onApprove, children }) => {
    const { uiConfig } = useUiConfig();
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

    const onReject = async () => {
        try {
            await changeState(projectId, Number(id), {
                state: 'Rejected',
            });
            refetchChangeRequest();
            refetchChangeRequestOpen();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Changes rejected',
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
    const popperWidth = anchorRef.current
        ? anchorRef.current.offsetWidth
        : null;

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
                {children}
            </PermissionButton>
            <Popper
                sx={{
                    zIndex: 1,
                    width: popperWidth,
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
                                        <ListItemIcon>
                                            <CheckBox fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>
                                            Approve changes
                                        </ListItemText>
                                    </MenuItem>
                                    <ConditionallyRender
                                        condition={Boolean(
                                            uiConfig?.flags?.changeRequestReject
                                        )}
                                        show={
                                            <MenuItem onClick={onReject}>
                                                <ListItemIcon>
                                                    <Clear fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    Reject changes
                                                </ListItemText>
                                            </MenuItem>
                                        }
                                    />
                                    <ConditionallyRender
                                        condition={Boolean(
                                            uiConfig?.flags?.changeRequestReject
                                        )}
                                        show={
                                            <MenuItem onClick={onReject}>
                                                Reject changes
                                            </MenuItem>
                                        }
                                    />
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
};
