import React, { FC, useContext } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';

import {
    ClickAwayListener,
    Grow,
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
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const ReviewButton: FC<{
    disabled: boolean;
    onReject: () => void;
    onApprove: () => void;
}> = ({ disabled, onReject, onApprove }) => {
    const { uiConfig } = useUiConfig();
    const { isAdmin } = useContext(AccessContext);
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { user } = useAuthUser();
    const { data } = useChangeRequest(projectId, id);

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

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
