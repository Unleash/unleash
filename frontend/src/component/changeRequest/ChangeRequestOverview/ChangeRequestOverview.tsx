import { Alert, Button, styled, Typography } from '@mui/material';
import { FC, useContext, useState } from 'react';
import { Box } from '@mui/material';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ChangeRequestHeader } from './ChangeRequestHeader/ChangeRequestHeader';
import { ChangeRequestTimeline } from './ChangeRequestTimeline/ChangeRequestTimeline';
import {
    ChangeRequestReviewers,
    ChangeRequestReviewersHeader,
} from './ChangeRequestReviewers/ChangeRequestReviewers';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { ChangeRequestReviewStatus } from './ChangeRequestReviewStatus/ChangeRequestReviewStatus';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Paper from '@mui/material/Paper';
import { ReviewButton } from './ReviewButton/ReviewButton';
import { ChangeRequestReviewer } from './ChangeRequestReviewers/ChangeRequestReviewer';
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

const ChangeRequestBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

export const ChangeRequestOverview: FC = () => {
    const projectId = useRequiredPathParam('projectId');
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const { user } = useAuthUser();
    const { isAdmin } = useContext(AccessContext);
    const [commentText, setCommentText] = useState('');

    const id = useRequiredPathParam('id');
    const { data: changeRequest, refetchChangeRequest } = useChangeRequest(
        projectId,
        id
    );
    const { changeState, addComment, loading } = useChangeRequestApi();
    const { refetch: refetchChangeRequestOpen } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfiguredForReview } =
        useChangeRequestsEnabled(projectId);

    if (!changeRequest) {
        return null;
    }

    const allowChangeRequestActions = isChangeRequestConfiguredForReview(
        changeRequest.environment
    );

    const onApplyChanges = async () => {
        try {
            await changeState(projectId, Number(id), {
                state: 'Applied',
            });
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

    const onCancel = () => setShowCancelDialog(true);
    const onCancelAbort = () => setShowCancelDialog(false);

    const isSelfReview =
        changeRequest?.createdBy.id === user?.id &&
        changeRequest.state === 'In review' &&
        !isAdmin;

    const hasApprovedAlready = changeRequest.approvals.some(
        approval => approval.createdBy.id === user?.id
    );
    return (
        <>
            <ChangeRequestHeader changeRequest={changeRequest} />
            <ChangeRequestBody>
                <StyledAsideBox>
                    <ChangeRequestTimeline state={changeRequest.state} />
                    <ChangeRequestReviewers
                        header={
                            <ChangeRequestReviewersHeader
                                actualApprovals={changeRequest.approvals.length}
                                minApprovals={changeRequest.minApprovals}
                            />
                        }
                    >
                        {changeRequest.approvals?.map(approver => (
                            <ChangeRequestReviewer
                                key={approver.createdBy.username}
                                name={
                                    approver.createdBy.username ||
                                    'Unknown user'
                                }
                                imageUrl={approver.createdBy.imageUrl}
                            />
                        ))}
                    </ChangeRequestReviewers>
                </StyledAsideBox>
                <StyledPaper elevation={0}>
                    <StyledInnerContainer>
                        Requested Changes ({changesCount(changeRequest)})
                        <ChangeRequest
                            changeRequest={changeRequest}
                            onRefetch={refetchChangeRequest}
                        />
                        {changeRequest.comments?.map(comment => (
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
                                variant="outlined"
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
                                    sx={theme => ({
                                        marginTop: theme.spacing(1.5),
                                    })}
                                    severity="info"
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
                                        disabled={!allowChangeRequestActions}
                                    />
                                }
                            />
                            <ConditionallyRender
                                condition={changeRequest.state === 'Approved'}
                                show={
                                    <PermissionButton
                                        variant="contained"
                                        onClick={onApplyChanges}
                                        projectId={projectId}
                                        permission={APPLY_CHANGE_REQUEST}
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
                            <ConditionallyRender
                                condition={
                                    changeRequest.state !== 'Applied' &&
                                    changeRequest.state !== 'Cancelled' &&
                                    (changeRequest.createdBy.id === user?.id ||
                                        isAdmin)
                                }
                                show={
                                    <Button
                                        sx={{
                                            marginLeft: theme =>
                                                theme.spacing(2),
                                        }}
                                        variant="outlined"
                                        onClick={onCancel}
                                    >
                                        Cancel changes
                                    </Button>
                                }
                            />
                        </StyledButtonBox>
                    </StyledInnerContainer>
                </StyledPaper>
                <Dialogue
                    open={showCancelDialog}
                    onClick={onCancelChanges}
                    onClose={onCancelAbort}
                    title="Cancel change request"
                >
                    <Typography sx={{ marginBottom: 2 }}>
                        You are about to cancel this change request
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={theme => ({ color: theme.palette.neutral.dark })}
                    >
                        The change request will be moved to closed, and it can't
                        be applied anymore. Once cancelled, the change request
                        can't be reopened.
                    </Typography>
                </Dialogue>
            </ChangeRequestBody>
        </>
    );
};
