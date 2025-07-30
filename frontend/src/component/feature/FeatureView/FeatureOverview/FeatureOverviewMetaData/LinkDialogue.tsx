import { type FC, useEffect, useState } from 'react';
import { Box, styled, TextField } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useFeatureLinkApi } from 'hooks/api/actions/useFeatureLinkApi/useFeatureLinkApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { FeatureLink } from 'interfaces/featureToggle';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

interface ILinkDialogueProps {
    project: string;
    featureId: string;
    onClose: () => void;
    mode: 'add' | 'edit';
    showDialogue: boolean;
    link: FeatureLink | null;
}

const LinkDialogue: FC<ILinkDialogueProps> = ({
    showDialogue,
    onClose,
    project,
    featureId,
    mode,
    link,
}) => {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [id, setId] = useState('');
    const { addLink, editLink, loading } = useFeatureLinkApi(
        project,
        featureId,
    );
    const { refetchFeature } = useFeature(project, featureId);
    const { setToastData, setToastApiError } = useToast();

    const isEditMode = mode === 'edit';
    const dialogueTitle = isEditMode ? 'Edit link' : 'Add link';
    const successMessage = isEditMode ? 'Link updated' : 'Link added';
    const { trackEvent } = usePlausibleTracker();

    useEffect(() => {
        if (isEditMode && link) {
            setUrl(link.url || '');
            setTitle(link.title || '');
            setId(link.id || '');
        } else if (!isEditMode) {
            setUrl('');
            setTitle('');
            setId('');
        }
    }, [isEditMode, link]);

    const handleSubmit = async () => {
        try {
            if (isEditMode) {
                await editLink(id, { url, title: title || null });
                trackEvent('feature-links', {
                    props: {
                        eventType: 'edit-link',
                    },
                });
            } else {
                await addLink({ url, title: title || null });
                trackEvent('feature-links', {
                    props: {
                        eventType: 'add-link',
                    },
                });
            }

            setToastData({ text: successMessage, type: 'success' });
            onClose();
            refetchFeature();
            setTitle('');
            setUrl('');
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isOpen = isEditMode ? link !== null : showDialogue;

    return (
        <Dialogue
            open={isOpen}
            title={dialogueTitle}
            onClose={onClose}
            disabledPrimaryButton={url.trim() === '' || loading}
            onClick={handleSubmit}
            primaryButtonText='Save'
            secondaryButtonText='Cancel'
        >
            <Box>
                <StyledTextField
                    label='Link'
                    placeholder='https://'
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

export const AddLinkDialogue: FC<Omit<ILinkDialogueProps, 'mode' | 'link'>> = (
    props,
) => {
    return <LinkDialogue {...props} mode='add' link={null} />;
};

export const EditLinkDialogue: FC<
    Omit<ILinkDialogueProps, 'mode' | 'showDialogue'>
> = (props) => {
    return (
        <LinkDialogue
            {...props}
            mode='edit'
            showDialogue={props.link !== null}
        />
    );
};
