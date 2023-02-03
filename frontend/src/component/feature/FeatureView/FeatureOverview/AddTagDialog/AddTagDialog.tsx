import { AutocompleteValue, styled, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ITagType } from 'interfaces/tags';
import { TagOption, TagsInput } from './TagsInput';
import TagTypeSelect from './TagTypeSelect';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import { AutocompleteChangeReason } from '@mui/base/AutocompleteUnstyled/useAutocomplete';
import useTags from 'hooks/api/getters/useTags/useTags';
import cloneDeep from 'lodash.clonedeep';

interface IAddTagDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const StyledDialogFormContent = styled('section')(({ theme }) => ({
    ['& > *']: {
        margin: theme.spacing(1, 0),
    },
}));

const AddTagDialog = ({ open, setOpen }: IAddTagDialogProps) => {
    const featureId = useRequiredPathParam('featureId');
    const { createTag } = useTagApi();
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

    const { tags: allTags, refetch: refetchAllTags } = useTags(tagType.name);

    const tagTypeOptions: TagOption[] = useMemo(() => {
        return allTags.map(tag => {
            return {
                title: tag.value,
            };
        });
    }, [allTags]);

    const onCancel = () => {
        setOpen(false);
        setSelectedTagOptions([]);
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
                        if (!tagOption.title.startsWith('Create')) {
                            await addTagToFeature(featureId, {
                                type: tagType.name,
                                value: tagOption.title,
                            });
                            added++;
                            await refetch();
                        }
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
            added > 0 &&
                setToastData({
                    type: 'success',
                    title: `Added tag${added > 1 ? 's' : ''} to toggle`,
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

    const handleInputChange = (
        event: React.SyntheticEvent,
        newValue: AutocompleteValue<
            TagOption | string,
            true,
            undefined,
            undefined
        >,
        reason: AutocompleteChangeReason
    ) => {
        if (reason === 'selectOption') {
            const clone = cloneDeep(newValue) as TagOption[];
            newValue.forEach((value, index) => {
                if (
                    typeof value !== 'string' &&
                    value.inputValue &&
                    value.inputValue !== ''
                ) {
                    const payload = {
                        value: value.inputValue,
                        type: tagType.name,
                    };
                    createTag(payload).then(() => {
                        refetchAllTags();
                    });
                    value.title = value.inputValue;
                    value.inputValue = '';
                    clone[index] = value;
                }
            });
            setSelectedTagOptions(clone);
        }
    };

    const hasSelectedValues = selectedTagOptions.length !== 0;

    const formId = 'add-tag-form';

    return (
        <>
            <Dialogue
                open={open}
                secondaryButtonText="Cancel"
                primaryButtonText={`Add tag (${selectedTagOptions.length})`}
                title="Add tags to feature toggle"
                onClick={onSubmit}
                disabledPrimaryButton={loading || !hasSelectedValues}
                onClose={onCancel}
                formId={formId}
            >
                <>
                    <Typography paragraph>
                        Tags allow you to group features together
                    </Typography>
                    <form id={formId} onSubmit={onSubmit}>
                        <StyledDialogFormContent>
                            <TagTypeSelect
                                autoFocus
                                value={tagType}
                                onChange={handleTagTypeChange}
                            />
                            <TagsInput
                                options={tagTypeOptions}
                                tagType={tagType.name}
                                featureTags={tags}
                                onChange={handleInputChange}
                            />
                        </StyledDialogFormContent>
                    </form>
                </>
            </Dialogue>
        </>
    );
};

export default AddTagDialog;
