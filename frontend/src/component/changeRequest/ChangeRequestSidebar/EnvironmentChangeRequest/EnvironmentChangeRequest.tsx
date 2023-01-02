import { FC } from 'react';
import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import { IChangeRequest } from '../../changeRequest.types';
import { useNavigate } from 'react-router-dom';
import { ChangeRequestStatusBadge } from '../../ChangeRequestStatusBadge/ChangeRequestStatusBadge';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { changesCount } from '../../changesCount';
import {
    Separator,
    StyledFlexAlignCenterBox,
    StyledSuccessIcon,
    UpdateCount,
} from '../ChangeRequestSidebar';
import { CloudCircle } from '@mui/icons-material';

const SubmitChangeRequestButton: FC<{ onClick: () => void; count: number }> = ({
    onClick,
    count,
}) => (
    <Button sx={{ ml: 'auto' }} variant="contained" onClick={onClick}>
        Submit change request ({count})
    </Button>
);

export const EnvironmentChangeRequest: FC<{
    environmentChangeRequest: IChangeRequest;
    onClose: () => void;
    onReview: (id: number) => void;
    onDiscard: (id: number) => void;
}> = ({ environmentChangeRequest, onClose, onReview, onDiscard, children }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Box
            key={environmentChangeRequest.id}
            sx={{
                padding: 3,
                border: '2px solid',
                mb: 5,
                borderColor: theme => theme.palette.secondaryContainer,
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            }}
        >
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
            <Typography variant="body2" color="text.secondary">
                You request changes for these feature toggles:
            </Typography>
            {children}
            <Box sx={{ display: 'flex', mt: 3 }}>
                <ConditionallyRender
                    condition={environmentChangeRequest?.state === 'Draft'}
                    show={
                        <>
                            <SubmitChangeRequestButton
                                onClick={() =>
                                    onReview(environmentChangeRequest.id)
                                }
                                count={changesCount(environmentChangeRequest)}
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
                                <Typography color={theme.palette.success.dark}>
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
        </Box>
    );
};
