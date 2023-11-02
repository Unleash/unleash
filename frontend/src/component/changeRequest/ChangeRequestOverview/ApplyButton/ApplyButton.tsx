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
import CheckBox from '@mui/icons-material/Check';
import Today from '@mui/icons-material/Today';

export const ApplyButton: FC<{
    disabled: boolean;
    onSchedule: () => void;
    onApply: () => void;
}> = ({ disabled, onSchedule: onSchedule, onApply: onApply, children }) => {
    const { isAdmin } = useContext(AccessContext);
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { user } = useAuthUser();
    const { data } = useChangeRequest(projectId, id);

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const onToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const onClose = (event: Event) => {
        if (anchorRef.current?.contains(event.target as HTMLElement)) {
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
                variant='contained'
                disabled={
                    disabled || (data?.createdBy.id === user?.id && !isAdmin)
                }
                aria-controls={open ? 'review-options-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label='review changes'
                aria-haspopup='menu'
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
                        <Paper className='dropdown-outline'>
                            <ClickAwayListener onClickAway={onClose}>
                                <MenuList
                                    id='review-options-menu'
                                    autoFocusItem
                                >
                                    <MenuItem onClick={onApply}>
                                        <ListItemIcon>
                                            <CheckBox fontSize='small' />
                                        </ListItemIcon>
                                        <ListItemText>
                                            Apply changes
                                        </ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={onSchedule}>
                                        <ListItemIcon>
                                            <Today fontSize='small' />
                                        </ListItemIcon>
                                        <ListItemText>
                                            Schedule changes
                                        </ListItemText>
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
