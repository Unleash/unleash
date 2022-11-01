import { FC } from 'react';
import { Box, Button, Paper } from '@mui/material';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ChangeRequestHeader } from './ChangeRequestHeader/ChangeRequestHeader';
import { ChangeRequestTimeline } from './ChangeRequestTimeline/ChangeRequestTimeline';
import { ChangeRequestReviewers } from './ChangeRequestReviewers/ChangeRequestReviewers';
import { ChangeRequest } from '../ChangeRequest/ChangeRequest';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ChangeRequestReviewStatus } from './ChangeRequestReviewStatus/ChangeRequestReviewStatus';

export const ChangeRequestOverview: FC = () => {
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { data: changeRequest } = useChangeRequest(projectId, id);
    const { applyChanges } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

    if (!changeRequest) {
        return null;
    }

    const onApplyChanges = async () => {
        try {
            await applyChanges(projectId, id);
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Changes appplied',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <ChangeRequestHeader changeRequest={changeRequest} />
            <Box sx={{ display: 'flex' }}>
                <Box
                    sx={{
                        width: '30%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <ChangeRequestTimeline />
                    <ChangeRequestReviewers />
                </Box>
                <Paper
                    elevation={0}
                    sx={theme => ({
                        marginTop: theme.spacing(2),
                        marginLeft: theme.spacing(2),
                        width: '70%',
                        padding: 2,
                        borderRadius: theme =>
                            `${theme.shape.borderRadiusLarge}px`,
                    })}
                >
                    <Box
                        sx={theme => ({
                            padding: theme.spacing(2),
                        })}
                    >
                        <ChangeRequest changeRequest={changeRequest} />
                        <ChangeRequestReviewStatus approved={true} />
                        <Button
                            variant="contained"
                            sx={{ marginTop: 2 }}
                            onClick={onApplyChanges}
                        >
                            Apply changes
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};
