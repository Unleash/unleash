import { Alert, styled } from '@mui/material';
import { FC, useContext } from 'react';
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
import Paper from '@mui/material/Paper';
import { ReviewButton } from './ReviewButton/ReviewButton';
import { ChangeRequestReviewer } from './ChangeRequestReviewers/ChangeRequestReviewer';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { APPLY_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import AccessContext from 'contexts/AccessContext';

const StyledAsideBox = styled(Box)(({ theme }) => ({
    width: '30%',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    width: '70%',
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledButtonBox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledInnerContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
}));

export const ChangeRequestOverview: FC = () => {
    const projectId = useRequiredPathParam('projectId');
    const { user } = useAuthUser();
    const { isAdmin } = useContext(AccessContext);

    const id = useRequiredPathParam('id');
    const { data: changeRequest, refetchChangeRequest } = useChangeRequest(
        projectId,
        id
    );
    const { changeState } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

    if (!changeRequest) {
        return null;
    }

    const onApplyChanges = async () => {
        try {
            await changeState(projectId, Number(id), {
                state: 'Applied',
            });
            refetchChangeRequest();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Changes applied',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isSelfReview =
        changeRequest?.createdBy.id === user?.id &&
        changeRequest.state === 'In review' &&
        !isAdmin;

    return (
        <>
            <ChangeRequestHeader changeRequest={changeRequest} />
            <Box sx={{ display: 'flex' }}>
                <StyledAsideBox>
                    <ChangeRequestTimeline state={changeRequest.state} />
                    <ConditionallyRender
                        condition={changeRequest.approvals?.length > 0}
                        show={
                            <ChangeRequestReviewers>
                                {/* @ts-expect-error - FIXME: type */}
                                {changeRequest.approvals?.map(approver => (
                                    <ChangeRequestReviewer
                                        name={
                                            approver.createdBy.username ||
                                            'Test account'
                                        }
                                        imageUrl={approver.createdBy.imageUrl}
                                    />
                                ))}
                            </ChangeRequestReviewers>
                        }
                    />
                </StyledAsideBox>
                <StyledPaper elevation={0}>
                    <StyledInnerContainer>
                        Changes
                        <ChangeRequest changeRequest={changeRequest} />
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
                            state={changeRequest.state}
                        />
                        <StyledButtonBox>
                            <ConditionallyRender
                                condition={changeRequest.state === 'In review'}
                                show={<ReviewButton />}
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
                                    >
                                        Apply changes
                                    </PermissionButton>
                                }
                            />
                        </StyledButtonBox>
                    </StyledInnerContainer>
                </StyledPaper>
            </Box>
        </>
    );
};
