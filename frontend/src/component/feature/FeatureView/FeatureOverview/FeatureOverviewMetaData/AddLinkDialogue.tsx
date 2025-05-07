import { type FC, useState } from 'react';
import { Box, styled, TextField } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useFeatureLinkApi } from 'hooks/api/actions/useFeatureLinkApi/useFeatureLinkApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IAddLinkDialogueProps {
    project: string;
    featureId: string;
    showAddLinkDialogue: boolean;
    onClose: () => void;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

export const AddLinkDialogue: FC<IAddLinkDialogueProps> = ({
    showAddLinkDialogue,
    onClose,
    project,
    featureId,
}) => {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const { addLink, loading } = useFeatureLinkApi(project, featureId);
    const { refetchFeature } = useFeature(project, featureId);
    const { setToastData, setToastApiError } = useToast();

    return (
        <Dialogue
            open={showAddLinkDialogue}
            title='Add link'
            onClose={onClose}
            disabledPrimaryButton={url.trim() === '' || loading}
            onClick={async () => {
                try {
                    await addLink({ url, title: title ?? null });
                    setToastData({ text: 'Link added', type: 'success' });
                } catch (error) {
                    setToastApiError(formatUnknownError(error));
                } finally {
                    refetchFeature();
                    onClose();
                }
            }}
            primaryButtonText='Add'
            secondaryButtonText='Cancel'
        >
            <Box>
                <StyledTextField
                    label='Link'
                    variant='outlined'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <StyledTextField
                    label='Title (optional)'
                    variant='outlined'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </Box>
        </Dialogue>
    );
};
