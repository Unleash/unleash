import React, { FC } from 'react';
import { Box } from '@mui/material';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ChangeRequestHeader } from './ChangeRequestHeader/ChangeRequestHeader';
import { ChangeRequestTimeline } from './ChangeRequestTimeline/ChangeRequestTimeline';
import { ChangeRequestReviewers } from './ChangeRequestReviewers/ChangeRequestReviewers';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { ChangeRequestReviewStatus } from './ChangeRequestReviewStatus/ChangeRequestReviewStatus';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

export const ChangeRequestOverview: FC = () => {
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { data: changeRequest, refetchChangeRequest } = useChangeRequest(
        projectId,
        id
    );
    const { applyChanges } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

    if (!changeRequest) {
        return null;
    }

    const onApplyChanges = async () => {
        try {
            await applyChanges(projectId, id);
            refetchChangeRequest();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Changes appplied',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <ChangeRequestHeader changeRequest={changeRequest} />
            <Box sx={{ display: 'flex' }}>
                <Box
                    sx={{
                        width: '30%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <ChangeRequestTimeline state={changeRequest.state} />
                    <ChangeRequestReviewers />
                </Box>
                <Paper
                    elevation={0}
                    sx={theme => ({
                        marginTop: theme.spacing(2),
                        marginLeft: theme.spacing(2),
                        width: '70%',
                        padding: 2,
                        borderRadius: theme =>
                            `${theme.shape.borderRadiusLarge}px`,
                    })}
                >
                    <Box
                        sx={theme => ({
                            padding: theme.spacing(2),
                        })}
                    >
                        Changes
                        <ChangeRequest changeRequest={changeRequest} />
                        <ChangeRequestReviewStatus
                            state={changeRequest.state}
                        />

                            <ConditionallyRender
                                condition={changeRequest.state === 'In review'}
                                show={<ReviewButton />}
                            />
                            <ConditionallyRender
                                condition={changeRequest.state === 'Approved'}
                                show={
                                    <Button
                                        variant="contained"
                                        onClick={onApplyChanges}
                                    >
                                        Apply changes
                                    </Button>
                                }
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

const options = ['Approve change', 'Reject change'];

const ReviewButton = () => {
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { refetchChangeRequest } = useChangeRequest(projectId, id);

    const { changeState } = useChangeRequestApi();

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const onMenuItemClick = async (index: number) => {
        try {
            const option = options[index];
            if (option.includes('Approve')) {
                await changeState(projectId, Number(id), { state: 'Approved' });
                refetchChangeRequest();
            }

            if (option.includes('Reject')) {
                await changeState(projectId, Number(id), {
                    state: 'Cancelled',
                });
                refetchChangeRequest();
            }
        } catch (error: unknown) {
            console.log(error);
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
