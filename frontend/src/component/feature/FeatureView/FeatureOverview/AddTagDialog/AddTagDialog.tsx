import { AutocompleteValue, styled, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ITag, ITagType } from 'interfaces/tags';
import { TagOption, TagsInput } from './TagsInput';
import TagTypeSelect from './TagTypeSelect';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import { AutocompleteChangeReason } from '@mui/base/AutocompleteUnstyled/useAutocomplete';
import useTags from 'hooks/api/getters/useTags/useTags';
import cloneDeep from 'lodash.clonedeep';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';

interface IAddTagDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const StyledDialogFormContent = styled('section')(({ theme }) => ({
    ['& > *']: {
        margin: theme.spacing(1, 0),
    },
}));

const tagsToOptions = (tags: ITag[]): TagOption[] => {
    return tags.map(tag => {
        return {
            title: tag.value,
        };
    });
};

const optionsToTags = (options: TagOption[], type: string): ITag[] => {
    return options.map(option => {
        return {
            value: option.title,
            type: type,
        };
    });
};

const AddTagDialog = ({ open, setOpen }: IAddTagDialogProps) => {
    const featureId = useRequiredPathParam('featureId');
    const { createTag } = useTagApi();
    const { updateFeatureTags, loading } = useFeatureApi();
    const { tags, refetch } = useFeatureTags(featureId);
    const { setToastData } = useToast();
    const [tagType, setTagType] = useState<ITagType>({
        name: 'simple',
        description: 'Simple tag to get you started',
        icon: '',
    });

    const { trackEvent } = usePlausibleTracker();

    const [selectedTagOptions, setSelectedTagOptions] = useState<TagOption[]>(
        []
    );

    const { tags: allTags, refetch: refetchAllTags } = useTags(tagType.name);

    const tagTypeOptions: TagOption[] = useMemo(() => {
        return tagsToOptions(allTags);
    }, [allTags]);

    useEffect(() => {
        if (tags && tagType) {
            setSelectedTagOptions(
                tagsToOptions(tags.filter(tag => tag.type === tagType.name))
            );
        }
    }, [tags, tagType]);

    const onCancel = () => {
        setOpen(false);
        setSelectedTagOptions([]);
    };

    function difference(array1: ITag[], array2: ITag[]) {
        const added = array1.filter(
            element =>
                !array2.find(
                    e2 => element.value === e2.value && element.type === e2.type
                )
        );
        const removed = array2.filter(
            element =>
                !array1.find(
                    e2 => element.value === e2.value && element.type === e2.type
                )
        );

        return { added, removed };
    }

    const realOptions = (allOptions: TagOption[]) => {
        return allOptions.filter(
            tagOption => !tagOption.title.startsWith('Create')
        );
    };

    const updateTags = async (added: ITag[], removed: ITag[]) => {
        try {
            await updateFeatureTags(featureId, {
                addedTags: added,
                removedTags: removed,
            });
            await refetch();
        } catch (error: unknown) {
            const message = formatUnknownError(error);
            setToastData({
                type: 'error',
                title: `Failed to add tag`,
                text: message,
                confetti: false,
            });
        }
    };

    const onSubmit = async (evt: React.SyntheticEvent) => {
        evt.preventDefault();
        if (selectedTagOptions.length !== 0) {
            const selectedTags: ITag[] = optionsToTags(
                realOptions(selectedTagOptions),
                tagType.name
            );

            const { added, removed } = difference(selectedTags, tags);
            await updateTags(added, removed);
            added.length > 1 &&
                trackEvent('suggest_tags', {
                    props: { eventType: 'multiple_tags_added' },
                });
            added.length > 0 &&
                setToastData({
                    type: 'success',
                    title: `Updated tag${
                        added.length > 1 ? 's' : ''
                    } to toggle`,
                    text: `We successfully added ${added.length} new tag${
                        added.length > 1 ? 's' : ''
                    } and removed ${removed.length} tag${
                        removed.length > 1 ? 's' : ''
                    } from your toggle`,
                    confetti: true,
                });
        }
        setOpen(false);
        setSelectedTagOptions([]);
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
        const clone = cloneDeep(newValue) as TagOption[];
        if (reason === 'selectOption') {
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
                        trackEvent('suggest_tags', {
                            props: { eventType: 'tag_created' },
                        });
                        refetchAllTags();
                    });
                    value.title = value.inputValue;
                    value.inputValue = '';
                    clone[index] = value;
                }
            });
        }
        setSelectedTagOptions(clone);
    };

    const hasSelectedValues = selectedTagOptions.length !== 0;

    const formId = 'add-tag-form';

    return (
        <>
            <Dialogue
                open={open}
                secondaryButtonText="Cancel"
                primaryButtonText={`Save tags`}
                title="Update tags to feature toggle"
                onClick={onSubmit}
                disabledPrimaryButton={loading || !hasSelectedValues}
                onClose={onCancel}
                formId={formId}
            >
                <>
                    <Typography
                        paragraph
                        sx={{ marginBottom: theme => theme.spacing(2.5) }}
                    >
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
                                existingTags={tags}
                                tagType={tagType}
                                selectedOptions={selectedTagOptions}
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
