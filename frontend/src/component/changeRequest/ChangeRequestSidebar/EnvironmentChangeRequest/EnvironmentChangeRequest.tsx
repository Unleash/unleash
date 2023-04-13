import React, { FC, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import { IChangeRequest } from '../../changeRequest.types';
import { useNavigate } from 'react-router-dom';
import { ChangeRequestStatusBadge } from '../../ChangeRequestStatusBadge/ChangeRequestStatusBadge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { changesCount } from '../../changesCount';
import {
    Separator,
    StyledFlexAlignCenterBox,
    StyledSuccessIcon,
    UpdateCount,
} from '../ChangeRequestSidebar';
import { CloudCircle } from '@mui/icons-material';
import { AddCommentField } from '../../ChangeRequestOverview/ChangeRequestComments/AddCommentField';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import Input from 'component/common/Input/Input';
import { ChangeRequestTitle } from './ChangeRequestTitle';

const SubmitChangeRequestButton: FC<{ onClick: () => void; count: number }> = ({
    onClick,
    count,
}) => (
    <Button sx={{ ml: 'auto' }} variant="contained" onClick={onClick}>
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
    mb: 5,
    borderColor: theme.palette.divider,
    borderRadius: `0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
    borderTop: 'none',
    overflow: 'hidden',
}));

export const EnvironmentChangeRequest: FC<{
    environmentChangeRequest: IChangeRequest;
    onClose: () => void;
    onReview: (id: number, comment?: string) => void;
    onDiscard: (id: number) => void;
}> = ({ environmentChangeRequest, onClose, onReview, onDiscard, children }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [commentText, setCommentText] = useState('');
    const { user } = useAuthUser();
    const [title, setTitle] = useState(environmentChangeRequest.title);

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
                        <CloudCircle
                            sx={theme => ({
                                color: theme.palette.primary.light,
                                mr: 0.5,
                            })}
                        />
                        <Typography component="span" variant="h2">
                            {environmentChangeRequest.environment}
                        </Typography>
                        <Separator />
                        <UpdateCount
                            count={environmentChangeRequest.features.length}
                        />
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                        <ChangeRequestStatusBadge
                            state={environmentChangeRequest.state}
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
                        label="Change request title"
                        id="group-name"
                        fullWidth
                        value={title}
                        onChange={() => {}}
                        disabled={true}
                    />
                </ChangeRequestTitle>
            </ChangeRequestHeader>
            <ChangeRequestContent>
                <Typography variant="body2" color="text.secondary">
                    You request changes for these feature toggles:
                </Typography>
                {children}

                <ConditionallyRender
                    condition={environmentChangeRequest?.state === 'Draft'}
                    show={
                        <AddCommentField
                            user={user}
                            commentText={commentText}
                            onTypeComment={setCommentText}
                        ></AddCommentField>
                    }
                ></ConditionallyRender>
                <Box sx={{ display: 'flex', mt: 3 }}>
                    <ConditionallyRender
                        condition={environmentChangeRequest?.state === 'Draft'}
                        show={
                            <>
                                <SubmitChangeRequestButton
                                    onClick={() =>
                                        onReview(
                                            environmentChangeRequest.id,
                                            commentText
                                        )
                                    }
                                    count={changesCount(
                                        environmentChangeRequest
                                    )}
                                />

                                <Button
                                    sx={{ ml: 2 }}
                                    variant="outlined"
                                    onClick={() =>
                                        onDiscard(environmentChangeRequest.id)
                                    }
                                >
                                    Discard changes
                                </Button>
                            </>
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
                                        variant="outlined"
                                        onClick={() => {
                                            onClose();
                                            navigate(
                                                `/projects/${environmentChangeRequest.project}/change-requests/${environmentChangeRequest.id}`
                                            );
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
