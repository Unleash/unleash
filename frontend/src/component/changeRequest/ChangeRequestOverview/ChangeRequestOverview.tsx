import { Alert, Box, Button, styled, Typography } from '@mui/material';
import { FC, useContext, useState } from 'react';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ChangeRequestHeader } from './ChangeRequestHeader/ChangeRequestHeader';
import { ChangeRequestTimeline } from './ChangeRequestTimeline/ChangeRequestTimeline';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { ChangeRequestReviewStatus } from './ChangeRequestReviewStatus/ChangeRequestReviewStatus';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Paper from '@mui/material/Paper';
import { ReviewButton } from './ReviewButton/ReviewButton';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { APPLY_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
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
import { useUiFlag } from 'hooks/useUiFlag';
import {
    ChangeRequestApplyScheduledDialogue,
    ChangeRequestRejectScheduledDialogue,
} from './ChangeRequestScheduledDialogs/changeRequestScheduledDialogs';
import { ScheduleChangeRequestDialog } from './ChangeRequestScheduledDialogs/ScheduleChangeRequestDialog';

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
    const { changeState, addComment, loading } = useChangeRequestApi();
    const { refetch: refetchChangeRequestOpen } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfiguredForReview } =
        useChangeRequestsEnabled(projectId);
    const scheduleChangeRequests = useUiFlag('scheduledConfigurationChanges');

    if (!changeRequest) {
        return null;
    }

    const allowChangeRequestActions = isChangeRequestConfiguredForReview(
        changeRequest.environment,
    );

    const onApplyChanges = async () => {
        try {
            await changeState(projectId, Number(id), {
                state: 'Applied',
            });
            setShowApplyScheduledDialog(false);
            refetchChangeRequest();
            refetchChangeRequestOpen();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Changes applied',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onScheduleChangeRequest = async (scheduledDate: Date) => {
        try {
            await changeState(projectId, Number(id), {
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
        }
    };

    const onAddComment = async () => {
        try {
            await addComment(projectId, id, commentText);
            setCommentText('');
            refetchChangeRequest();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Comment added',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onCancelChanges = async () => {
        try {
            await changeState(projectId, Number(id), {
                state: 'Cancelled',
            });
            setShowCancelDialog(false);
            refetchChangeRequest();
            refetchChangeRequestOpen();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Changes cancelled',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onReject = async (comment?: string) => {
        try {
            await changeState(projectId, Number(id), {
                state: 'Rejected',
                comment,
            });
            setShowRejectDialog(false);
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

    const onCancel = () => setShowCancelDialog(true);
    const onCancelAbort = () => setShowCancelDialog(false);
    const onCancelReject = () => setShowRejectDialog(false);
    const onApplyScheduledAbort = () => setShowApplyScheduledDialog(false);
    const onScheduleChangeAbort = () => setShowApplyScheduledDialog(false);
    const onRejectScheduledAbort = () => setShowRejectScheduledDialog(false);

    const isSelfReview =
        changeRequest?.createdBy.id === user?.id &&
        changeRequest.state === 'In review' &&
        !isAdmin;

    const hasApprovedAlready = changeRequest.approvals?.some(
        (approval) => approval.createdBy.id === user?.id,
    );

    const countOfChanges = changesCount(changeRequest);
    console.log('allowChangeRequestActions: ', allowChangeRequestActions);
    return (
        <>
            <ChangeRequestHeader changeRequest={changeRequest} />
            <ChangeRequestBody>
                <StyledAsideBox>
                    <ChangeRequestTimeline state={changeRequest.state} />
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
                                    commentText.trim().length > 1000
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
                                        disabled={!allowChangeRequestActions}
                                    >
                                        Review changes ({countOfChanges})
                                    </ReviewButton>
                                }
                            />
                            <ConditionallyRender
                                condition={changeRequest.state === 'Approved'}
                                show={
                                    <ConditionallyRender
                                        condition={scheduleChangeRequests}
                                        show={
                                            <ApplyButton
                                                onApply={onApplyChanges}
                                                disabled={
                                                    !allowChangeRequestActions ||
                                                    loading
                                                }
                                                onSchedule={() =>
                                                    setShowScheduleChangeDialog(
                                                        true,
                                                    )
                                                }
                                            >
                                                Apply or schedule changes
                                            </ApplyButton>
                                        }
                                        elseShow={
                                            <PermissionButton
                                                variant='contained'
                                                onClick={onApplyChanges}
                                                projectId={projectId}
                                                permission={
                                                    APPLY_CHANGE_REQUEST
                                                }
                                                environmentId={
                                                    changeRequest.environment
                                                }
                                                disabled={
                                                    !allowChangeRequestActions ||
                                                    loading
                                                }
                                            >
                                                Apply changes
                                            </PermissionButton>
                                        }
                                    />
                                }
                            />
                            <ConditionallyRender
                                condition={
                                    scheduleChangeRequests &&
                                    changeRequest.state === 'Scheduled' &&
                                    changeRequest.schedule?.status === 'pending'
                                }
                                show={
                                    <ApplyButton
                                        onApply={() =>
                                            setShowApplyScheduledDialog(true)
                                        }
                                        disabled={
                                            !allowChangeRequestActions ||
                                            loading
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
                                    changeRequest.state !== 'Applied' &&
                                    changeRequest.state !== 'Rejected' &&
                                    changeRequest.state !== 'Cancelled' &&
                                    (changeRequest.createdBy.id === user?.id ||
                                        isAdmin)
                                }
                                show={
                                    <ConditionallyRender
                                        condition={
                                            scheduleChangeRequests &&
                                            Boolean(
                                                changeRequest.schedule
                                                    ?.scheduledAt,
                                            )
                                        }
                                        show={
                                            <StyledButton
                                                variant='outlined'
                                                onClick={() =>
                                                    setShowRejectScheduledDialog(
                                                        true,
                                                    )
                                                }
                                            >
                                                Reject changes
                                            </StyledButton>
                                        }
                                        elseShow={
                                            <StyledButton
                                                variant='outlined'
                                                onClick={onCancel}
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
                />
                <ConditionallyRender
                    condition={scheduleChangeRequests}
                    show={
                        <>
                            <ScheduleChangeRequestDialog
                                open={showScheduleChangesDialog}
                                onConfirm={onScheduleChangeRequest}
                                onClose={onScheduleChangeAbort}
                                disabled={!allowChangeRequestActions || loading}
                                projectId={projectId}
                                environment={changeRequest.environment}
                                primaryButtonText={
                                    changeRequest?.schedule?.scheduledAt
                                        ? 'Update scheduled time'
                                        : 'Schedule changes'
                                }
                                title={
                                    changeRequest?.schedule?.scheduledAt
                                        ? 'Update schedule'
                                        : 'Schedule changes'
                                }
                                scheduledAt={
                                    changeRequest?.schedule?.scheduledAt ||
                                    undefined
                                }
                            />
                            <ChangeRequestApplyScheduledDialogue
                                open={showApplyScheduledDialog}
                                onConfirm={onApplyChanges}
                                onClose={onApplyScheduledAbort}
                                scheduledTime={
                                    changeRequest?.schedule?.scheduledAt
                                }
                                disabled={!allowChangeRequestActions || loading}
                                projectId={projectId}
                                environment={changeRequest.environment}
                            />
                            <ChangeRequestRejectScheduledDialogue
                                open={showRejectScheduledDialog}
                                onConfirm={onReject}
                                onClose={onRejectScheduledAbort}
                                scheduledTime={
                                    changeRequest?.schedule?.scheduledAt
                                }
                            />
                        </>
                    }
                />
            </ChangeRequestBody>
        </>
    );
};
