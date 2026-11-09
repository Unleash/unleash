import {
    type AutocompleteProps,
    type AutocompleteValue,
    styled,
    Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeatureTags from 'hooks/api/getters/useFeatureTags/useFeatureTags';
import useToast from 'hooks/useToast';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { ITag, ITagType } from 'interfaces/tags';
import { type TagOption, TagsInput } from './TagsInput.tsx';
import { TagTypeSelect } from './TagTypeSelect.tsx';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import useTags from 'hooks/api/getters/useTags/useTags';
import { useTracking } from 'hooks/useTracking';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    createTagValueTracking,
    editFlagTagsTracking,
} from './flagTagsTracking.ts';

interface IManageTagsProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const StyledDialogFormContent = styled('section')(({ theme }) => ({
    '& > *': {
        margin: theme.spacing(1, 0),
    },
}));

const tagsToOptions = (tags: ITag[]): TagOption[] => {
    return tags.map((tag) => {
        return {
            title: tag.value,
        };
    });
};

const optionsToTags = (options: TagOption[], type: string): ITag[] => {
    return options.map((option) => {
        return {
            value: option.title,
            type: type,
        };
    });
};

const isSameTag = (a: ITag, b: ITag) =>
    a.value === b.value && a.type === b.type;

const difference = (selected: ITag[], existing: ITag[], type: string) => {
    const ofType = (tag: ITag) => tag.type === type;
    const added = selected
        .filter(ofType)
        .filter((tag) => !existing.some((other) => isSameTag(tag, other)));
    const removed = existing
        .filter(ofType)
        .filter((tag) => !selected.some((other) => isSameTag(tag, other)));
    return { added, removed };
};

export const ManageTagsDialog = ({ open, setOpen }: IManageTagsProps) => {
    const { tagTypes } = useTagTypes();
    const featureId = useRequiredPathParam('featureId');
    const { createTag } = useTagApi();
    const { updateFeatureTags, loading: featureLoading } = useFeatureApi();
    const { tags, refetch, loading: tagsLoading } = useFeatureTags(featureId);
    const { setToastData, setToastApiError } = useToast();
    const initialTagType =
        tagTypes && tagTypes.length > 0
            ? tagTypes[0]
            : {
                  name: 'simple',
                  description: 'Simple tag to get you started',
                  icon: '',
              };
    const [tagType, setTagType] = useState<ITagType>(initialTagType);

    const loading = featureLoading || tagsLoading;

    const trackCreateTagValue = useTracking(createTagValueTracking);

    const [selectedTagOptions, setSelectedTagOptions] = useState<TagOption[]>(
        tagsToOptions(tags.filter((tag) => tag.type === tagType.name)),
    );

    const { tags: allTags, refetch: refetchAllTags } = useTags(tagType.name);

    const tagTypeOptions: TagOption[] = useMemo(() => {
        return tagsToOptions(allTags);
    }, [allTags]);

    useEffect(() => {
        if (tags && tagType) {
            setSelectedTagOptions(
                tagsToOptions(tags.filter((tag) => tag.type === tagType.name)),
            );
        }
    }, [JSON.stringify(tags), tagType, open]);

    const { added, removed } = useMemo(
        () =>
            difference(
                optionsToTags(selectedTagOptions, tagType.name),
                tags,
                tagType.name,
            ),
        [selectedTagOptions, tags, tagType.name],
    );
    const differenceCount = added.length + removed.length;

    const onCancel = () => {
        setOpen(false);
        setSelectedTagOptions([]);
    };

    const _getToastText = (addedCount: number, removedCount: number) => {
        let result = 'We successfully';
        if (addedCount > 0)
            result = result.concat(
                ` added ${addedCount} new tag${addedCount > 1 ? 's' : ''}`,
            );

        if (addedCount > 0 && removedCount > 0) {
            result = result.concat(' and ');
        }

        if (removedCount > 0) {
            result = result.concat(
                ` removed ${removedCount} tag${removedCount > 1 ? 's' : ''}`,
            );
        }
        return result;
    };

    const onSubmit = async () => {
        await updateFeatureTags(featureId, {
            addedTags: added,
            removedTags: removed,
        });
        await refetch();
        setToastData({
            type: 'success',
            text: `Updated flag tags`,
        });
        setSelectedTagOptions([]);
        setOpen(false);
    };

    const handleTagTypeChange = (
        event: React.SyntheticEvent,
        value: AutocompleteValue<ITagType, false, any, any>,
    ) => {
        if (value != null && typeof value !== 'string') {
            event.preventDefault();
            setTagType(value);
            setSelectedTagOptions([]);
        }
    };

    const createNewTagOnTheFly = (value: string) =>
        trackCreateTagValue
            .mutation(() => createTag({ value, type: tagType.name }))
            .then(() => {
                refetchAllTags();
                setSelectedTagOptions((prev) =>
                    prev.some(({ title }) => title === value)
                        ? prev
                        : [...prev, { title: value }],
                );
            })
            .catch((error: unknown) => {
                setToastApiError(formatUnknownError(error));
            });

    const handleInputChange: AutocompleteProps<
        TagOption,
        true,
        false,
        false
    >['onChange'] = (_event, newValue, reason, selected) => {
        const option = selected?.option;
        if (reason === 'selectOption' && option?.inputValue) {
            // The "Create new value" option's title is its label, not the
            // value, so only select the value once it exists.
            setSelectedTagOptions(newValue.filter((value) => value !== option));
            createNewTagOnTheFly(option.inputValue);
            return;
        }
        setSelectedTagOptions(newValue);
    };

    const formId = 'add-tag-form';

    return (
        <Dialogue
            open={open}
            secondaryButtonText='Cancel'
            primaryButtonText='Save tags'
            title='Update feature flag tags'
            onSubmit={onSubmit}
            onError={(error) => setToastApiError(formatUnknownError(error))}
            tracking={editFlagTagsTracking({
                addedCount: added.length,
                removedCount: removed.length,
                tagCount: tags.length + added.length - removed.length,
            })}
            disabledPrimaryButton={loading || differenceCount === 0}
            onClose={onCancel}
            formId={formId}
        >
            <>
                <Typography
                    sx={{ marginBottom: (theme) => theme.spacing(2.5) }}
                >
                    Tags allow you to group features together
                </Typography>
                <form id={formId} onSubmit={(event) => event.preventDefault()}>
                    <StyledDialogFormContent>
                        <TagTypeSelect
                            options={tagTypes}
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
    );
};
