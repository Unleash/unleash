import { FC } from 'react';
import { Box, Button, Paper } from '@mui/material';
import { useSuggestedChange } from 'hooks/api/getters/useSuggestChange/useSuggestedChange';
import { SuggestedChangeHeader } from './SuggestedChangeHeader/SuggestedChangeHeader';
import { SuggestedChangeTimeline } from './SuggestedChangeTimeline/SuggestedChangeTimeline';
import { SuggestedChangeReviewers } from './SuggestedChangeReviewers/SuggestedChangeReviewers';
import { SuggestedChangeset } from '../SuggestedChangeset/SuggestedChangeset';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useSuggestChangeApi } from 'hooks/api/actions/useSuggestChangeApi/useSuggestChangeApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { SuggestedChangeReviewStatus } from './SuggestedChangeReviewStatus/SuggestedChangeReviewStatus';

export const SuggestedChangeOverview: FC = () => {
    const projectId = useRequiredPathParam('projectId');
    const id = useRequiredPathParam('id');
    const { data: suggestedChange } = useSuggestedChange(projectId, id);
    const { applyChanges } = useSuggestChangeApi();
    const { setToastData, setToastApiError } = useToast();

    if (!suggestedChange) {
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
            <SuggestedChangeHeader suggestedChange={suggestedChange} />
            <Box sx={{ display: 'flex' }}>
                <Box
                    sx={{
                        width: '30%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <SuggestedChangeTimeline />
                    <SuggestedChangeReviewers />
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
                        <SuggestedChangeset suggestedChange={suggestedChange} />
                        <SuggestedChangeReviewStatus approved={true} />
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
