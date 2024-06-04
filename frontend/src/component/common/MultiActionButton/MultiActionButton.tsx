import React, { type FC } from 'react';

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
import PermissionButton from 'component/common/PermissionButton/PermissionButton';

type Action = {
    label: string;
    onSelect: () => void;
    icon: JSX.Element;
};

export const MultiActionButton: FC<{
    disabled: boolean;
    actions: Action[];
    permission: string;
    projectId?: string;
    environmentId?: string;
    ariaLabel?: string;
    children?: React.ReactNode;
}> = ({
    disabled,
    children,
    actions,
    permission,
    projectId,
    ariaLabel,
    environmentId,
}) => {
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
                disabled={disabled}
                aria-controls={open ? 'review-options-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label={ariaLabel}
                aria-haspopup='menu'
                onClick={onToggle}
                ref={anchorRef}
                endIcon={<ArrowDropDownIcon />}
                permission={permission}
                projectId={projectId}
                environmentId={environmentId}
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
                                    {actions.map(
                                        ({ label, onSelect, icon }) => (
                                            <MenuItem
                                                disabled={disabled}
                                                onClick={onSelect}
                                                key={`MenuItem-${label}`}
                                            >
                                                <ListItemIcon>
                                                    {icon}
                                                </ListItemIcon>
                                                <ListItemText>
                                                    {label}
                                                </ListItemText>
                                            </MenuItem>
                                        ),
                                    )}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
};
