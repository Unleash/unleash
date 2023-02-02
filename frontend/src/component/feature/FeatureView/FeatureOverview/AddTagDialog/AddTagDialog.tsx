import { AutocompleteValue, styled } from '@mui/material';
import React, { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ITagType } from 'interfaces/tags';
import { TagOption, TagsInput } from './TagsInput';
import TagTypeSelect from './TagTypeSelect';

interface IAddTagDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const StyledDialogFormContent = styled('section')(({ theme }) => ({
    ['& > *']: {
        margin: theme.spacing(1.5, 0),
    },
}));

const AddTagDialog = ({ open, setOpen }: IAddTagDialogProps) => {
    const featureId = useRequiredPathParam('featureId');
    const { addTagToFeature, loading } = useFeatureApi();
    const { tags, refetch } = useFeatureTags(featureId);
    const { setToastData } = useToast();
    const [tagType, setTagType] = useState<ITagType>({
        name: 'simple',
        description: 'Simple tag to get you started',
        icon: '',
    });

    const [selectedTagOptions, setSelectedTagOptions] = useState<TagOption[]>(
        []
    );

    const onCancel = () => {
        setOpen(false);
    };

    const onSubmit = async (evt: React.SyntheticEvent) => {
        evt.preventDefault();
        let added = 0;
        if (selectedTagOptions.length !== 0) {
            for (const tagOption of selectedTagOptions) {
                if (
                    !tags.includes({
                        type: tagType.name,
                        value: tagOption.title,
                    })
                ) {
                    try {
                        await addTagToFeature(featureId, {
                            type: tagType.name,
                            value: tagOption.title,
                        });
                        added++;
                    } catch (error: unknown) {
                        const message = formatUnknownError(error);
                        setToastData({
                            type: 'error',
                            title: `Failed to add tag`,
                            text: message,
                            confetti: false,
                        });
                    }
                }
            }
            refetch();
            setToastData({
                type: 'success',
                title: `Added ${added} tag${added > 1 ? 's' : ''} to toggle`,
                text: `We successfully added ${added} new tag${
                    added > 1 ? 's' : ''
                } to your toggle`,
                confetti: true,
            });
            setOpen(false);
            setSelectedTagOptions([]);
        }
    };

    const handleTagTypeChange = (
        event: React.SyntheticEvent,
        value: AutocompleteValue<ITagType, false, any, any>
    ) => {
        if (value != null && typeof value !== 'string') {
            event.preventDefault();
            setTagType(value);
        }
    };

    const isValid =
        selectedTagOptions.length !== 0 &&
        tags.length !== selectedTagOptions.length;

    const formId = 'add-tag-form';

    return (
        <>
            <Dialogue
                open={open}
                secondaryButtonText="Cancel"
                primaryButtonText={`Add tag (${selectedTagOptions.length})`}
                title="Add tags"
                onClick={onSubmit}
                disabledPrimaryButton={loading || !isValid}
                onClose={onCancel}
                formId={formId}
            >
                <form id={formId} onSubmit={onSubmit}>
                    <StyledDialogFormContent>
                        <TagTypeSelect
                            autoFocus
                            value={tagType}
                            onChange={handleTagTypeChange}
                        />
                        <TagsInput
                            featureTags={tags}
                            tagType={tagType.name}
                            onChange={setSelectedTagOptions}
                        />
                    </StyledDialogFormContent>
                </form>
            </Dialogue>
        </>
    );
};

export default AddTagDialog;
