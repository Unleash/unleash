import { useRef, useState, type VFC } from 'react';
import {
    useTheme,
    IconButton,
    Typography,
    useMediaQuery,
    Popover,
    Box,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import HelpOutline from '@mui/icons-material/HelpOutline';
import ChangeRequestProcessWithScheduleImage from 'assets/img/changeRequestProcessWithSchedule.svg?react';

type IChangeRequestProcessHelpProps = {};

export const ChangeRequestProcessHelp: VFC<
    IChangeRequestProcessHelpProps
> = () => {
    const ref = useRef<HTMLButtonElement>(null);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [isOpen, setIsOpen] = useState(false);

    const descriptionId = 'change-request-process-description';

    return (
        <>
            <ConditionallyRender
                condition={!isSmallScreen}
                show={
                    <Typography variant='body2'>
                        Show change request process{' '}
                    </Typography>
                }
            />
            <IconButton
                title='Change request process'
                ref={ref}
                onClick={() => setIsOpen(true)}
            >
                <HelpOutline />
            </IconButton>
            <Popover
                open={isOpen}
                anchorEl={ref.current}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClose={() => setIsOpen(false)}
            >
                <Box
                    sx={{ p: { xs: 2, md: 4 }, maxWidth: 920 }}
                    id={descriptionId}
                >
                    <Typography variant='h3'>
                        Change request process:
                    </Typography>
                    <Typography variant='body2'>
                        <ol>
                            <li>
                                When changes are detected they are added to a
                                draft.
                            </li>
                            <li>
                                The user can submit the changes for review or
                                discard them.
                                <ul>
                                    <li>
                                        Once submitted, the changes are visible
                                        to everyone.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                A user with the{' '}
                                <strong>“Review change request”</strong>{' '}
                                permission can approve or reject the changes.
                                <ul>
                                    <li>
                                        The user who created the change request
                                        can cancel it at this stage.
                                    </li>
                                    <li>
                                        Rejecting or canceling the changes will
                                        close the change request.
                                    </li>
                                </ul>
                            </li>
                            <>
                                <li>
                                    Once approved, a user with the{' '}
                                    <strong>
                                        “Apply/Reject change request”
                                    </strong>{' '}
                                    permission can apply, schedule, or reject
                                    the changes.
                                    <ul>
                                        <li>
                                            If applied, the changes will take
                                            effect and the change request will
                                            be closed.
                                        </li>
                                        <li>
                                            If scheduled, Unleash will attempt
                                            to apply the changes at the
                                            scheduled date and time.
                                        </li>
                                        <li>
                                            The user who created the change
                                            request can cancel the changes up
                                            until they are applied or scheduled.
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    A user with the{' '}
                                    <strong>
                                        “Apply/Reject change request”
                                    </strong>{' '}
                                    permission can reschedule, reject, or
                                    immediately apply a scheduled change
                                    request.
                                    <ul>
                                        <li>
                                            If any of the flags or strategies in
                                            the change request are archived or
                                            deleted (outside of the change
                                            request), thus creating a conflict,
                                            Unleash will send an email out to
                                            the change request author and to the
                                            user who (last) scheduled the change
                                            request.
                                        </li>
                                        <li>
                                            If the scheduled changes contain any
                                            conflicts, Unleash will refuse to
                                            apply them.
                                        </li>
                                        <li>
                                            If the user who scheduled the
                                            changes is removed from this Unleash
                                            instance, the scheduled changes will
                                            also not be applied.
                                        </li>
                                    </ul>
                                </li>
                            </>
                        </ol>
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <ChangeRequestProcessWithScheduleImage
                            aria-details={descriptionId}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                            }}
                        />
                    </Box>
                </Box>
            </Popover>
        </>
    );
};
