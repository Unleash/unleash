import { useEffect, useState, VFC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AutocompleteProps, Link, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { TagTypeSelect } from './TagTypeSelect';
import { TagOption, TagsInput } from './TagsInput';
import useTags from 'hooks/api/getters/useTags/useTags';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';
import { ITag, ITagType } from 'interfaces/tags';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';

interface IDialogUIProps {
    open: boolean;
    initialValues: ITag[];
    initialIndeterminateValues: ITag[];
    onCancel: () => void;
    onSubmit: () => void;
}

const StyledDialogFormContent = styled('section')(({ theme }) => ({
    ['& > *']: {
        margin: theme.spacing(1, 0),
    },
}));

const formId = 'manage-tags-form';

export const DialogUI: VFC<IDialogUIProps> = ({
    open,
    initialValues,
    initialIndeterminateValues,
    onCancel,
    onSubmit,
}) => {
    const { tagTypes, loading: tagTypesLoading } = useTagTypes();
    const [tagType, setTagType] = useState<typeof tagTypes[0]>({
        name: '',
        description: '',
        icon: '',
    });
    const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
    const [indeterminateTags, setIndeterminateTags] = useState<TagOption[]>([]);
    const { tags, refetch: refetchTags } = useTags(tagType.name);
    const { createTag } = useTagApi();
    const tagsOptions = tags.map(({ value }) => ({ title: value }));

    const changeTagType = (tagType: ITagType) => {
        setTagType(tagType);
        const newIndeterminateValues = initialIndeterminateValues.filter(
            ({ type }) => type === tagType.name
        );
        setSelectedTags(
            initialValues
                .filter(({ type }) => type === tagType.name)
                .filter(
                    ({ type, value }) =>
                        !newIndeterminateValues.some(
                            tag => tag.value === value && tag.type === type
                        )
                )
                .map(({ value }) => ({
                    title: value,
                }))
        );
        setIndeterminateTags(
            newIndeterminateValues.map(({ value }) => ({
                title: value,
            }))
        );
    };

    useEffect(() => {
        if (tagTypes.length > 0) {
            changeTagType(tagTypes[0]);
        }
    }, [tagTypesLoading]);

    const handleTagTypeChange: AutocompleteProps<
        ITagType,
        false,
        any,
        any
    >['onChange'] = (event, value) => {
        if (value != null && typeof value !== 'string') {
            event.preventDefault();
            changeTagType(value);
        }
    };

    const handleInputChange: AutocompleteProps<
        TagOption,
        true,
        false,
        false
    >['onChange'] = (_event, newValue, reason) => {
        if (reason === 'selectOption') {
            newValue.forEach(value => {
                if (
                    typeof value !== 'string' &&
                    value.inputValue &&
                    value.title.startsWith('Create new value')
                ) {
                    createTag({
                        value: value.inputValue,
                        type: tagType.name,
                    }).then(async () => {
                        await refetchTags();
                        setSelectedTags(prev => [
                            ...prev,
                            { title: value.inputValue as string },
                        ]);
                    });
                } else {
                    setSelectedTags(newValue as TagOption[]);
                    setIndeterminateTags((prev: TagOption[]) =>
                        prev.filter(({ title }) => title !== value.title)
                    );
                }
            });
        } else if (reason === 'clear') {
            setSelectedTags([]);
        } else if (reason === 'removeOption') {
            setSelectedTags(newValue as TagOption[]);
        }
    };

    return (
        <Dialogue
            open={open}
            secondaryButtonText="Cancel"
            primaryButtonText="Save tags"
            title="Update tags to feature toggle"
            onClick={onSubmit}
            // FIXME: disable submit
            disabledPrimaryButton={true}
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
                            key={tagTypesLoading ? 'loading' : tagTypes.length}
                            options={tagTypes}
                            disabled={tagTypesLoading || tagTypes.length === 0}
                            value={tagType}
                            onChange={handleTagTypeChange}
                        />
                        <ConditionallyRender
                            condition={
                                !tagTypesLoading && tagTypes.length === 0
                            }
                            show={
                                <Typography variant="body1">
                                    No{' '}
                                    <Link
                                        component={RouterLink}
                                        to="/tag-types"
                                    >
                                        tag types
                                    </Link>{' '}
                                    available.
                                </Typography>
                            }
                            elseShow={
                                <TagsInput
                                    disabled={tagTypesLoading}
                                    options={tagsOptions}
                                    existingTags={initialValues}
                                    indeterminateOptions={indeterminateTags}
                                    tagType={tagType}
                                    selectedOptions={selectedTags}
                                    onChange={handleInputChange}
                                />
                            }
                        />
                    </StyledDialogFormContent>
                </form>
            </>
        </Dialogue>
    );
};
