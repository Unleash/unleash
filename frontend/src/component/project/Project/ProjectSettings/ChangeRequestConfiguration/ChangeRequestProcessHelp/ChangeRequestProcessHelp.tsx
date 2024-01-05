import { useRef, useState, VFC } from 'react';
import {
    useTheme,
    IconButton,
    Typography,
    useMediaQuery,
    Popover,
    Box,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HelpOutline } from '@mui/icons-material';
import { ReactComponent as ChangeRequestProcessImage } from 'assets/img/changeRequestProcess.svg';
import { useUiFlag } from 'hooks/useUiFlag';
import { ReactComponent as ChangeRequestProcessWithScheduleImage } from 'assets/img/changeRequestProcessWithSchedule.svg';

type IChangeRequestProcessHelpProps = {};

export const ChangeRequestProcessHelp: VFC<IChangeRequestProcessHelpProps> =
    () => {
        const ref = useRef<HTMLButtonElement>(null);
        const theme = useTheme();
        const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
        const [isOpen, setIsOpen] = useState(false);
        const showScheduleInformation = useUiFlag(
            'scheduledConfigurationChanges',
        );

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
                    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 920 }}>
                        <Typography variant='h3'>
                            Change request process:
                        </Typography>
                        <Typography variant='body2'>
                            <ol>
                                <li>
                                    <p>
                                        When changes are detected they are added
                                        to a draft.
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        The user can submit the changes for
                                        review or discard them.
                                    </p>
                                    <ul>
                                        <li>
                                            <p>
                                                Once submitted, the changes are
                                                visible to everyone.
                                            </p>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <p>
                                        A user with the{' '}
                                        <strong>“Review change request”</strong>{' '}
                                        permission can approve or reject the
                                        changes.
                                    </p>
                                    <ul>
                                        <li>
                                            <p>
                                                The user who created the change
                                                request can cancel it at this
                                                stage.
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                Rejecting or canceling the
                                                changes will close the change
                                                request.
                                            </p>
                                        </li>
                                    </ul>
                                </li>
                                <ConditionallyRender
                                    condition={showScheduleInformation}
                                    show={
                                        <>
                                            <li>
                                                <p>
                                                    Once approved, a user with
                                                    the{' '}
                                                    <strong>
                                                        “Apply/Reject change
                                                        request”
                                                    </strong>{' '}
                                                    permission can apply,
                                                    schedule, or reject the
                                                    changes.
                                                </p>
                                                <ul>
                                                    <li>
                                                        <p>
                                                            If applied, the
                                                            changes will take
                                                            effect and the
                                                            change request will
                                                            be closed.
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <p>
                                                            If scheduled,
                                                            Unleash will attempt
                                                            to apply the changes
                                                            at the scheduled
                                                            date and time.
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <p>
                                                            The user who created
                                                            the change request
                                                            can cancel the
                                                            changes up until
                                                            they are applied or
                                                            scheduled.
                                                        </p>
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <p>
                                                    A user with the{' '}
                                                    <strong>
                                                        “Apply/Reject change
                                                        request”
                                                    </strong>{' '}
                                                    permission can reschedule,
                                                    reject, or immediately apply
                                                    a scheduled change request.
                                                </p>
                                                <ul>
                                                    <li>
                                                        <p>
                                                            If any of the flags
                                                            or strategies in the
                                                            change request are
                                                            archived or deleted
                                                            (outside of the
                                                            change request),
                                                            thus creating a
                                                            conflict, Unleash
                                                            will send an email
                                                            out to the change
                                                            request author and
                                                            to the user who
                                                            (last) scheduled the
                                                            change request.
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <p>
                                                            If the scheduled
                                                            changes contain any
                                                            conflicts, Unleash
                                                            will refuse to apply
                                                            them.
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <p>
                                                            If the user who
                                                            scheduled the
                                                            changes is removed
                                                            from this Unleash
                                                            instance, the
                                                            scheduled changes
                                                            will also not be
                                                            applied.
                                                        </p>
                                                    </li>
                                                </ul>
                                            </li>
                                        </>
                                    }
                                    elseShow={
                                        <li>
                                            <p>
                                                Once approved, a user with the{' '}
                                                <strong>
                                                    “Apply/Reject change
                                                    request”
                                                </strong>{' '}
                                                permission can apply or reject
                                                the changes.
                                            </p>
                                            <ul>
                                                <li>
                                                    <p>
                                                        Once applied, the
                                                        changes will take effect
                                                        and the change request
                                                        will be closed.
                                                    </p>
                                                </li>
                                                <li>
                                                    <p>
                                                        The user who created the
                                                        change request can
                                                        cancel the changes up
                                                        until they are applied.
                                                    </p>
                                                </li>
                                            </ul>
                                        </li>
                                    }
                                />
                            </ol>
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <ConditionallyRender
                                condition={showScheduleInformation}
                                show={
                                    <ChangeRequestProcessWithScheduleImage
                                        style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                        }}
                                    />
                                }
                                elseShow={
                                    <ChangeRequestProcessImage
                                        style={{
                                            maxWidth: 'calc(100vw - 4rem)',
                                        }}
                                    />
                                }
                            />
                        </Box>
                    </Box>
                </Popover>
            </>
        );
    };
