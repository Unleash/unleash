import { type FC, useEffect, useState } from 'react';
import { Box, styled, TextField } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useFeatureLinkApi } from 'hooks/api/actions/useFeatureLinkApi/useFeatureLinkApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { FeatureLink } from 'interfaces/featureToggle';

interface IAddLinkDialogueProps {
    project: string;
    featureId: string;
    showDialogue: boolean;
    onClose: () => void;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

export const LinkDialogue: FC<IAddLinkDialogueProps> = ({
    showDialogue,
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
            open={showDialogue}
            title='Add link'
            onClose={onClose}
            disabledPrimaryButton={url.trim() === '' || loading}
            onClick={async () => {
                try {
                    await addLink({ url, title: title ?? null });
                    setToastData({ text: 'Link added', type: 'success' });
                    onClose();
                    refetchFeature();
                    setTitle('');
                    setUrl('');
                } catch (error) {
                    setToastApiError(formatUnknownError(error));
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

interface IEditLinkDialogueProps {
    project: string;
    featureId: string;
    onClose: () => void;
    link: FeatureLink | null;
}

export const EditLinkDialogue: FC<IEditLinkDialogueProps> = ({
    onClose,
    project,
    featureId,
    link,
}) => {
    const [url, setUrl] = useState(link?.url || '');
    const [title, setTitle] = useState(link?.title || '');
    const [id, setId] = useState(link?.id || '');
    const { editLink, loading } = useFeatureLinkApi(project, featureId);
    const { refetchFeature } = useFeature(project, featureId);
    const { setToastData, setToastApiError } = useToast();

    useEffect(() => {
        setUrl(link?.url || '');
        setTitle(link?.title || '');
        setId(link?.id || '');
    }, [JSON.stringify(link)]);

    return (
        <Dialogue
            open={link !== null}
            title='Edit link'
            onClose={onClose}
            disabledPrimaryButton={url.trim() === '' || loading}
            onClick={async () => {
                try {
                    await editLink(id, { url, title: title ?? null });
                    setToastData({ text: 'Link updated', type: 'success' });
                    onClose();
                    refetchFeature();
                    setTitle('');
                    setUrl('');
                } catch (error) {
                    setToastApiError(formatUnknownError(error));
                }
            }}
            primaryButtonText='Edit'
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
