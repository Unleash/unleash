import { Alert, Box, Button, styled, Typography } from '@mui/material';
import { type FC, useContext, useState } from 'react';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ChangeRequestHeader } from './ChangeRequestHeader/ChangeRequestHeader';
import {
    ChangeRequestTimeline,
    type ISuggestChangeTimelineProps,
} from './ChangeRequestTimeline/ChangeRequestTimeline';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { ChangeRequestReviewStatus } from './ChangeRequestReviewStatus/ChangeRequestReviewStatus';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Paper from '@mui/material/Paper';
import { ReviewButton } from './ReviewButton/ReviewButton';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import AccessContext from 'contexts/AccessContext';
import { ChangeRequestComment } from './ChangeRequestComments/ChangeRequestComment';
import { AddCommentField } from './ChangeRequestComments/AddCommentField';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { changesCount } from '../changesCount';
import { ChangeRequestReviewers } from './ChangeRequestReviewers/ChangeRequestReviewers';
import { ChangeRequestRejectDialogue } from './ChangeRequestRejectDialog/ChangeRequestRejectDialog';
import { ApplyButton } from './ApplyButton/ApplyButton';
import {
    ChangeRequestApplyScheduledDialogue,
    ChangeRequestRejectScheduledDialogue,
} from './ChangeRequestScheduledDialogs/changeRequestScheduledDialogs';
import { ScheduleChangeRequestDialog } from './ChangeRequestScheduledDialogs/ScheduleChangeRequestDialog';
import type { PlausibleChangeRequestState } from '../changeRequest.types';
import { useNavigate } from 'react-router-dom';

const StyledAsideBox = styled(Box)(({ theme }) => ({
    width: '30%',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    width: '70%',
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadiusLarge,
    [theme.breakpoints.down('sm')]: {
        marginLeft: 0,
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

const StyledButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

const ChangeRequestBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
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
            setToastData({
                type: 'success',
                title: 'Success',
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
            setToastData({
                type: 'success',
                title: 'Success',
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
                title: 'Success',
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
            setToastData({
                type: 'success',
                title: 'Success',
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
                title: 'Success',
                text: 'Changes rejected',
            });
            refetchChangeRequestOpen();
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
            refetchChangeRequestOpen();
            setToastData({
                type: 'success',
                title: 'Success',
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
                    <ChangeRequestTimeline {...timelineProps} />
                    <ChangeRequestReviewers changeRequest={changeRequest} />
                </StyledAsideBox>
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
                                    You can not approve your own change request
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
                                condition={changeRequest.state === 'Approved'}
                                show={
                                    <ApplyButton
                                        onApply={onApplyChanges}
                                        disabled={
                                            !allowChangeRequestActions ||
                                            disabled
                                        }
                                        onSchedule={() =>
                                            setShowScheduleChangeDialog(true)
                                        }
                                    >
                                        Apply or schedule changes
                                    </ApplyButton>
                                }
                            />
                            <ConditionallyRender
                                condition={changeRequest.state === 'Scheduled'}
                                show={
                                    <ApplyButton
                                        onApply={() =>
                                            setShowApplyScheduledDialog(true)
                                        }
                                        disabled={
                                            !allowChangeRequestActions ||
                                            disabled
                                        }
                                        onSchedule={() =>
                                            setShowScheduleChangeDialog(true)
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
                                    (changeRequest.createdBy.id === user?.id ||
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
