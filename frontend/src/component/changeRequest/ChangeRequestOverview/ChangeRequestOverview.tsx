import {
    Alert,
    Box,
    Button,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import { type FC, useContext, useState } from 'react';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ChangeRequestHeader } from './ChangeRequestHeader/ChangeRequestHeader.tsx';
import {
    ChangeRequestTimeline,
    type ISuggestChangeTimelineProps,
} from './ChangeRequestTimeline/ChangeRequestTimeline.tsx';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { ChangeRequestReviewStatus } from './ChangeRequestReviewStatus/ChangeRequestReviewStatus.tsx';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Paper from '@mui/material/Paper';
import { ReviewButton } from './ReviewButton/ReviewButton.tsx';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import AccessContext from 'contexts/AccessContext';
import { ChangeRequestComment } from './ChangeRequestComments/ChangeRequestComment.tsx';
import { AddCommentField } from './ChangeRequestComments/AddCommentField.tsx';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { changesCount } from '../changesCount.ts';
import { ChangeRequestRejectDialogue } from './ChangeRequestRejectDialog/ChangeRequestRejectDialog.tsx';
import { ApplyButton } from './ApplyButton/ApplyButton.tsx';
import {
    ChangeRequestApplyScheduledDialogue,
    ChangeRequestRejectScheduledDialogue,
} from './ChangeRequestScheduledDialogs/changeRequestScheduledDialogs.tsx';
import { ScheduleChangeRequestDialog } from './ChangeRequestScheduledDialogs/ScheduleChangeRequestDialog.tsx';
import type { PlausibleChangeRequestState } from '../changeRequest.types';
import { useNavigate } from 'react-router-dom';
import { useActionableChangeRequests } from 'hooks/api/getters/useActionableChangeRequests/useActionableChangeRequests';
import { ChangeRequestRequestedApprovers } from './ChangeRequestRequestedApprovers/ChangeRequestRequestedApprovers.tsx';
import { ChangeRequestIcon } from 'component/common/ChangeRequestIcon/ChangeRequestIcon.tsx';

const breakpoint = 'md';

const StyledAsideBox = styled(Box)(({ theme }) => ({
    width: '30%',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down(breakpoint)]: {
        width: '100%',
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledApplyPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadiusLarge,
    marginTop: theme.spacing(2),
}));

const StyledDiv = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
    width: '70%',
    borderRadius: theme.shape.borderRadiusLarge,
    [theme.breakpoints.down(breakpoint)]: {
        width: '100%',
    },
}));

const StyledButtonBox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledInnerContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledApplyInnerContainer = styled(Box)(({ theme }) => ({
    paddingBottom: theme.spacing(1.5),
}));

const StyledOuterContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

const ChangeRequestBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    columnGap: theme.spacing(2),
    [theme.breakpoints.down(breakpoint)]: {
        flexDirection: 'column',
    },
}));

const StyledApplyContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
}));

const StyledBox = styled(Box)(({ theme }) => ({
    width: '100%',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
}));

const StyledButtonContainer = styled(Box)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    backgroundColor: theme.palette.primary.main!,
    padding: theme.spacing(1, 2),
    marginRight: theme.spacing(2),
    height: '45px',
    width: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    svg: {
        color: theme.palette.background.paper,
    },
}));

export const ChangeRequestOverview: FC = () => {
    const projectId = useRequiredPathParam('projectId');
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showScheduleChangesDialog, setShowScheduleChangeDialog] =
        useState(false);
    const [showApplyScheduledDialog, setShowApplyScheduledDialog] =
        useState(false);
    const [showRejectScheduledDialog, setShowRejectScheduledDialog] =
        useState(false);
    const { user } = useAuthUser();
    const { isAdmin } = useContext(AccessContext);
    const [commentText, setCommentText] = useState('');
    const { refetch: refetchActionableChangeRequests } =
        useActionableChangeRequests(projectId);

    const id = useRequiredPathParam('id');
    const { data: changeRequest, refetchChangeRequest } = useChangeRequest(
        projectId,
        id,
    );
    const { changeState, addComment } = useChangeRequestApi();
    const { refetch: refetchChangeRequestOpen } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfiguredForReview } =
        useChangeRequestsEnabled(projectId);
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    if (!changeRequest) {
        return null;
    }

    const allowChangeRequestActions = isChangeRequestConfiguredForReview(
        changeRequest.environment,
    );

    const getCurrentState = (): PlausibleChangeRequestState => {
        switch (changeRequest.state) {
            case 'Scheduled':
                return `${changeRequest.state} ${changeRequest.schedule.status}`;
            default:
                return changeRequest.state;
        }
    };

    const onApplyChanges = async () => {
        try {
            setDisabled(true);
            await changeState(projectId, Number(id), getCurrentState(), {
                state: 'Applied',
            });
            setShowApplyScheduledDialog(false);
            await refetchChangeRequest();
            refetchChangeRequestOpen();
            refetchActionableChangeRequests();
            setToastData({
                type: 'success',
                text: 'Changes applied',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setDisabled(false);
        }
    };

    const onScheduleChangeRequest = async (scheduledDate: Date) => {
        try {
            setDisabled(true);
            await changeState(projectId, Number(id), getCurrentState(), {
                state: 'Scheduled',
                scheduledAt: scheduledDate.toISOString(),
            });
            setShowScheduleChangeDialog(false);
            refetchChangeRequest();
            refetchChangeRequestOpen();
            refetchActionableChangeRequests();
            setToastData({
                type: 'success',
                text: 'Changes scheduled',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setDisabled(false);
        }
    };

    const onAddComment = async () => {
        try {
            setDisabled(true);
            await addComment(projectId, id, commentText);
            setCommentText('');
            await refetchChangeRequest();
            setToastData({
                type: 'success',
                text: 'Comment added',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setDisabled(false);
        }
    };

    const onCancelChanges = async () => {
        try {
            setDisabled(true);
            await changeState(projectId, Number(id), getCurrentState(), {
                state: 'Cancelled',
            });
            setShowCancelDialog(false);
            await refetchChangeRequest();
            refetchChangeRequestOpen();
            refetchActionableChangeRequests();
            setToastData({
                type: 'success',
                text: 'Changes cancelled',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setDisabled(false);
        }
    };

    const onReject = async (comment?: string) => {
        try {
            setDisabled(true);
            await changeState(projectId, Number(id), getCurrentState(), {
                state: 'Rejected',
                comment,
            });
            setShowRejectDialog(false);
            await refetchChangeRequest();

            setToastData({
                type: 'success',
                text: 'Changes rejected',
            });
            refetchChangeRequestOpen();
            refetchActionableChangeRequests();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setDisabled(false);
        }
    };

    const onApprove = async () => {
        try {
            setDisabled(true);
            await changeState(projectId, Number(id), getCurrentState(), {
                state: 'Approved',
            });
            await refetchChangeRequest();
            refetchActionableChangeRequests();
            refetchChangeRequestOpen();
            setToastData({
                type: 'success',
                text: 'Changes approved',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setDisabled(false);
        }
    };

    const onCancel = () => setShowCancelDialog(true);
    const onCancelAbort = () => setShowCancelDialog(false);
    const onCancelReject = () => setShowRejectDialog(false);
    const onApplyScheduledAbort = () => setShowApplyScheduledDialog(false);
    const onScheduleChangeAbort = () => setShowScheduleChangeDialog(false);
    const onRejectScheduledAbort = () => setShowRejectScheduledDialog(false);

    const isSelfReview =
        changeRequest?.createdBy.id === user?.id &&
        changeRequest.state === 'In review' &&
        !isAdmin;

    const hasApprovedAlready = changeRequest.approvals?.some(
        (approval) => approval.createdBy.id === user?.id,
    );

    const countOfChanges = changesCount(changeRequest);

    const scheduledAt =
        'schedule' in changeRequest
            ? changeRequest.schedule.scheduledAt
            : undefined;

    const timelineProps: ISuggestChangeTimelineProps =
        changeRequest.state === 'Scheduled'
            ? {
                  state: 'Scheduled',
                  schedule: changeRequest.schedule,
              }
            : {
                  state: changeRequest.state,
                  schedule: undefined,
              };

    return (
        <>
            <ChangeRequestHeader changeRequest={changeRequest} />
            <ChangeRequestBody>
                <StyledAsideBox>
                    <ChangeRequestTimeline
                        {...timelineProps}
                        timestamps={changeRequest.stateTimestamps}
                    />
                    <ChangeRequestRequestedApprovers
                        changeRequest={changeRequest}
                    />
                </StyledAsideBox>
                <StyledDiv>
                    <StyledPaper elevation={0}>
                        <StyledInnerContainer>
                            Requested Changes ({countOfChanges})
                            <ChangeRequest
                                changeRequest={changeRequest}
                                onRefetch={refetchChangeRequest}
                            />
                            {changeRequest.comments?.map((comment) => (
                                <ChangeRequestComment
                                    key={comment.id}
                                    comment={comment}
                                />
                            ))}
                            <AddCommentField
                                user={user}
                                commentText={commentText}
                                onTypeComment={setCommentText}
                            >
                                <Button
                                    variant='outlined'
                                    onClick={onAddComment}
                                    disabled={
                                        !allowChangeRequestActions ||
                                        commentText.trim().length === 0 ||
                                        commentText.trim().length > 1000 ||
                                        disabled
                                    }
                                >
                                    Comment
                                </Button>
                            </AddCommentField>
                            <ConditionallyRender
                                condition={isSelfReview}
                                show={
                                    <Alert
                                        sx={(theme) => ({
                                            marginTop: theme.spacing(1.5),
                                        })}
                                        severity='info'
                                    >
                                        You can not approve your own change
                                        request
                                    </Alert>
                                }
                            />
                            <ChangeRequestReviewStatus
                                changeRequest={changeRequest}
                                onEditClick={() =>
                                    setShowScheduleChangeDialog(true)
                                }
                            />
                            <StyledButtonBox>
                                <ConditionallyRender
                                    condition={
                                        changeRequest.state === 'In review' &&
                                        !hasApprovedAlready
                                    }
                                    show={
                                        <ReviewButton
                                            onReject={() =>
                                                setShowRejectDialog(true)
                                            }
                                            onApprove={onApprove}
                                            disabled={
                                                !allowChangeRequestActions ||
                                                disabled
                                            }
                                        >
                                            Review changes ({countOfChanges})
                                        </ReviewButton>
                                    }
                                />

                                <ConditionallyRender
                                    condition={
                                        changeRequest.state === 'Scheduled'
                                    }
                                    show={
                                        <ApplyButton
                                            onApply={() =>
                                                setShowApplyScheduledDialog(
                                                    true,
                                                )
                                            }
                                            disabled={
                                                !allowChangeRequestActions ||
                                                disabled
                                            }
                                            onSchedule={() =>
                                                setShowScheduleChangeDialog(
                                                    true,
                                                )
                                            }
                                            variant={'update'}
                                        >
                                            Apply or schedule changes
                                        </ApplyButton>
                                    }
                                />

                                <ConditionallyRender
                                    condition={
                                        changeRequest.state === 'In review' ||
                                        changeRequest.state === 'Approved' ||
                                        changeRequest.state === 'Scheduled'
                                    }
                                    show={
                                        <StyledButton
                                            variant='outlined'
                                            onClick={() => {
                                                navigate(
                                                    `/playground?changeRequest=${changeRequest.id}&projects=${projectId}&environments=${changeRequest.environment}`,
                                                );
                                            }}
                                        >
                                            Preview changes
                                        </StyledButton>
                                    }
                                />

                                <ConditionallyRender
                                    condition={
                                        changeRequest.state !== 'Applied' &&
                                        changeRequest.state !== 'Rejected' &&
                                        changeRequest.state !== 'Cancelled' &&
                                        (changeRequest.createdBy.id ===
                                            user?.id ||
                                            isAdmin)
                                    }
                                    show={
                                        <ConditionallyRender
                                            condition={Boolean(scheduledAt)}
                                            show={
                                                <StyledButton
                                                    variant='outlined'
                                                    onClick={() =>
                                                        setShowRejectScheduledDialog(
                                                            true,
                                                        )
                                                    }
                                                    disabled={disabled}
                                                >
                                                    Reject changes
                                                </StyledButton>
                                            }
                                            elseShow={
                                                <StyledButton
                                                    variant='outlined'
                                                    onClick={onCancel}
                                                    disabled={disabled}
                                                >
                                                    Cancel changes
                                                </StyledButton>
                                            }
                                        />
                                    }
                                />
                            </StyledButtonBox>
                        </StyledInnerContainer>
                    </StyledPaper>
                    <ConditionallyRender
                        condition={changeRequest.state === 'Approved'}
                        show={
                            <StyledApplyPaper elevation={0}>
                                <StyledApplyInnerContainer>
                                    <StyledOuterContainer>
                                        <StyledButtonContainer>
                                            <ChangeRequestIcon />
                                        </StyledButtonContainer>
                                        <StyledBox>
                                            <StyledTypography>
                                                Apply changes
                                            </StyledTypography>
                                            <Typography>
                                                The change request has been
                                                reviewed and approved
                                            </Typography>
                                        </StyledBox>

                                        <StyledApplyContainer>
                                            <ApplyButton
                                                onApply={onApplyChanges}
                                                disabled={
                                                    !allowChangeRequestActions ||
                                                    disabled
                                                }
                                                onSchedule={() =>
                                                    setShowScheduleChangeDialog(
                                                        true,
                                                    )
                                                }
                                            >
                                                Apply or schedule changes
                                            </ApplyButton>
                                        </StyledApplyContainer>
                                    </StyledOuterContainer>
                                </StyledApplyInnerContainer>
                            </StyledApplyPaper>
                        }
                    />
                </StyledDiv>
                <Dialogue
                    open={showCancelDialog}
                    onClick={onCancelChanges}
                    onClose={onCancelAbort}
                    title='Cancel change request'
                >
                    <Typography sx={{ marginBottom: 2 }}>
                        You are about to cancel this change request
                    </Typography>
                    <Typography
                        variant='body2'
                        sx={(theme) => ({ color: theme.palette.neutral.dark })}
                    >
                        The change request will be moved to closed, and it can't
                        be applied anymore. Once cancelled, the change request
                        can't be reopened.
                    </Typography>
                </Dialogue>
                <ChangeRequestRejectDialogue
                    open={showRejectDialog}
                    onConfirm={onReject}
                    onClose={onCancelReject}
                    disabled={disabled}
                />
                <>
                    <ScheduleChangeRequestDialog
                        open={showScheduleChangesDialog}
                        onConfirm={onScheduleChangeRequest}
                        onClose={onScheduleChangeAbort}
                        disabled={!allowChangeRequestActions || disabled}
                        projectId={projectId}
                        environment={changeRequest.environment}
                        primaryButtonText={
                            changeRequest.state === 'Scheduled'
                                ? 'Update scheduled time'
                                : 'Schedule changes'
                        }
                        title={
                            changeRequest.state === 'Scheduled'
                                ? 'Update schedule'
                                : 'Schedule changes'
                        }
                        scheduledAt={scheduledAt}
                    />
                    <ChangeRequestApplyScheduledDialogue
                        open={showApplyScheduledDialog}
                        onConfirm={onApplyChanges}
                        onClose={onApplyScheduledAbort}
                        scheduledTime={scheduledAt}
                        disabled={!allowChangeRequestActions || disabled}
                        projectId={projectId}
                        environment={changeRequest.environment}
                    />
                    <ChangeRequestRejectScheduledDialogue
                        open={showRejectScheduledDialog}
                        onConfirm={onReject}
                        onClose={onRejectScheduledAbort}
                        scheduledTime={scheduledAt}
                        disabled={disabled}
                    />
                </>
            </ChangeRequestBody>
        </>
    );
};
