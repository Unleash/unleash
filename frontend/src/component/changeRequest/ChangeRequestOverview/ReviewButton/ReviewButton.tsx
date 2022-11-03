import React from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';

import {
    Button,
    Grow,
    Paper,
    Popper,
    MenuItem,
    MenuList,
    ClickAwayListener,
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const options = ['Approve change', 'Reject change'];

export const ReviewButton = () => {
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { refetchChangeRequest } = useChangeRequest(projectId, id);
    const { setToastApiError, setToastData } = useToast();

    const { changeState } = useChangeRequestApi();

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const onMenuItemClick = async (index: number) => {
        try {
            const option = options[index];
            if (option.includes('Approve')) {
                await changeState(projectId, Number(id), { state: 'Approved' });
                refetchChangeRequest();
                setToastData({
                    type: 'success',
                    title: 'Success',
                    text: 'Changes approved',
                });
            }

            if (option.includes('Reject')) {
                await changeState(projectId, Number(id), {
                    state: 'Cancelled',
                });
                refetchChangeRequest();
                setToastData({
                    type: 'success',
                    title: 'Success',
                    text: 'Changes rejected',
                });
            }
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
            <Button
                variant="contained"
                aria-controls={open ? 'review-options-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="review changes"
                aria-haspopup="menu"
                onClick={onToggle}
                ref={anchorRef}
                endIcon={<ArrowDropDownIcon />}
            >
                Review changes
            </Button>
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
                        <Paper>
                            <ClickAwayListener onClickAway={onClose}>
                                <MenuList
                                    id="review-options-menu"
                                    autoFocusItem
                                >
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option}
                                            onClick={() =>
                                                onMenuItemClick(index)
                                            }
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
};
