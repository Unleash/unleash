import type React from 'react';
import { type FC, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import type { ChangeRequestType } from '../../changeRequest.types';
import { Link } from 'react-router-dom';
import { ChangeRequestStatusBadge } from '../../ChangeRequestStatusBadge/ChangeRequestStatusBadge.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    Separator,
    StyledFlexAlignCenterBox,
    StyledSuccessIcon,
} from '../ChangeRequestSidebar.tsx';
import { AddCommentField } from '../../ChangeRequestOverview/ChangeRequestComments/AddCommentField.tsx';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import Input from 'component/common/Input/Input';
import { ChangeRequestTitle } from './ChangeRequestTitle.tsx';
import { UpdateCount } from 'component/changeRequest/UpdateCount';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { DraftChangeRequestActions } from '../DraftChangeRequestActions/DraftChangeRequestActions.tsx';
import type { AvailableReviewerSchema } from 'hooks/api/getters/useAvailableChangeRequestReviewers/useAvailableChangeRequestReviewers.ts';

const _SubmitChangeRequestButton: FC<{
    onClick: () => void;
    count: number;
    disabled?: boolean;
}> = ({ onClick, count, disabled = false }) => (
    <Button
        sx={{ ml: 'auto' }}
        variant='contained'
        onClick={onClick}
        disabled={disabled}
    >
        Submit change request ({count})
    </Button>
);

const ChangeRequestHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 3, 1, 3),
    border: '2px solid',
    borderColor: theme.palette.divider,
    borderRadius: `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0`,
    borderBottom: 'none',
    overflow: 'hidden',
    backgroundColor: theme.palette.neutral.light,
}));

const ChangeRequestContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 3, 3, 3),
    border: '2px solid',
    marginBottom: theme.spacing(5),
    borderColor: theme.palette.divider,
    borderRadius: `0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
    borderTop: 'none',
    overflow: 'hidden',
}));

export const EnvironmentChangeRequest: FC<{
    environmentChangeRequest: ChangeRequestType;
    onClose: () => void;
    onReview: (changeState: (project: string) => Promise<void>) => void;
    onDiscard: (id: number) => void;
    children?: React.ReactNode;
}> = ({ environmentChangeRequest, onClose, onReview, onDiscard, children }) => {
    const theme = useTheme();
    const [commentText, setCommentText] = useState('');
    const { user } = useAuthUser();
    const [title, setTitle] = useState(environmentChangeRequest.title);
    const { changeState, updateRequestedApprovers } = useChangeRequestApi();
    const [reviewers, setReviewers] = useState<AvailableReviewerSchema[]>([]);

    const [disabled, setDisabled] = useState(false);
    const sendToReview = async (project: string) => {
        setDisabled(true);
        try {
            await changeState(project, environmentChangeRequest.id, 'Draft', {
                state: 'In review',
                comment: commentText,
            });

            if (reviewers && reviewers.length > 0) {
                await updateRequestedApprovers(
                    project,
                    environmentChangeRequest.id,
                    reviewers.map((reviewer) => reviewer.id),
                );
            }
        } catch (_e) {
            setDisabled(false);
        }
    };

    return (
        <Box key={environmentChangeRequest.id}>
            <ChangeRequestHeader>
                <Box sx={{ display: 'flex', alignItems: 'end' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography component='span' variant='h2'>
                            {environmentChangeRequest.environment}
                        </Typography>
                        <Separator />
                        <Typography
                            component='span'
                            variant='body2'
                            color='text.secondary'
                        >
                            Updates:
                        </Typography>
                        <UpdateCount
                            featuresCount={
                                environmentChangeRequest.features.length
                            }
                            segmentsCount={
                                environmentChangeRequest.segments.length
                            }
                        />
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                        <ChangeRequestStatusBadge
                            changeRequest={environmentChangeRequest}
                        />
                    </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                <ChangeRequestTitle
                    environmentChangeRequest={environmentChangeRequest}
                    title={title}
                    setTitle={setTitle}
                >
                    <Input
                        label='Change request title'
                        id='group-name'
                        fullWidth
                        value={title}
                        onChange={() => {}}
                        disabled={true}
                    />
                </ChangeRequestTitle>
            </ChangeRequestHeader>
            <ChangeRequestContent>
                {children}
                <ConditionallyRender
                    condition={environmentChangeRequest?.state === 'Draft'}
                    show={
                        <AddCommentField
                            user={user}
                            commentText={commentText}
                            onTypeComment={setCommentText}
                        />
                    }
                />
                <Box sx={{ display: 'flex', mt: 3 }}>
                    <ConditionallyRender
                        condition={environmentChangeRequest?.state === 'Draft'}
                        show={
                            <DraftChangeRequestActions
                                environmentChangeRequest={
                                    environmentChangeRequest
                                }
                                reviewers={reviewers}
                                setReviewers={setReviewers}
                                onReview={onReview}
                                onDiscard={onDiscard}
                                sendToReview={sendToReview}
                                disabled={disabled}
                                setDisabled={setDisabled}
                            />
                        }
                    />
                    <ConditionallyRender
                        condition={
                            environmentChangeRequest.state === 'In review' ||
                            environmentChangeRequest.state === 'Approved'
                        }
                        show={
                            <>
                                <StyledFlexAlignCenterBox>
                                    <StyledSuccessIcon />
                                    <Typography
                                        color={theme.palette.success.dark}
                                    >
                                        Draft successfully sent to review
                                    </Typography>
                                    <Button
                                        sx={{ marginLeft: 2 }}
                                        variant='outlined'
                                        component={Link}
                                        to={`/projects/${environmentChangeRequest.project}/change-requests/${environmentChangeRequest.id}`}
                                        onClick={() => {
                                            onClose();
                                        }}
                                    >
                                        View change request page
                                    </Button>
                                </StyledFlexAlignCenterBox>
                            </>
                        }
                    />
                </Box>
            </ChangeRequestContent>
        </Box>
    );
};
