import { useEffect, useReducer, useState, VFC } from 'react';
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

type Payload = {
    addedTags: ITag[];
    removedTags: ITag[];
};

interface IManageBulkTagsDialogProps {
    open: boolean;
    initialValues: ITag[];
    initialIndeterminateValues: ITag[];
    onCancel: () => void;
    onSubmit: (payload: Payload) => void;
}

const StyledDialogFormContent = styled('section')(({ theme }) => ({
    ['& > *']: {
        margin: theme.spacing(1, 0),
    },
}));

const formId = 'manage-tags-form';

const mergeTags = (tags: ITag[], newTag: ITag) => [
    ...tags,
    ...(tags.some(x => x.value === newTag.value && x.type === newTag.type)
        ? []
        : [newTag]),
];

const filterTags = (tags: ITag[], tag: ITag) =>
    tags.filter(x => !(x.value === tag.value && x.type === tag.type));

const payloadReducer = (
    state: Payload,
    action:
        | {
              type: 'add' | 'remove';
              payload: ITag;
          }
        | {
              type: 'clear';
              payload: ITag[];
          }
) => {
    switch (action.type) {
        case 'add':
            return {
                ...state,
                addedTags: mergeTags(state.addedTags, action.payload),
                removedTags: filterTags(state.removedTags, action.payload),
            };
        case 'remove':
            return {
                ...state,
                addedTags: filterTags(state.addedTags, action.payload),
                removedTags: mergeTags(state.removedTags, action.payload),
            };
        case 'clear':
            return {
                addedTags: [],
                removedTags: action.payload,
            };
        default:
            return state;
    }
};

const emptyTagType = {
    name: '',
    description: '',
    icon: '',
};

export const ManageBulkTagsDialog: VFC<IManageBulkTagsDialogProps> = ({
    open,
    initialValues,
    initialIndeterminateValues,
    onCancel,
    onSubmit,
}) => {
    const { tagTypes, loading: tagTypesLoading } = useTagTypes();
    const [tagType, setTagType] = useState<typeof tagTypes[0]>(emptyTagType);
    const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
    const [indeterminateTags, setIndeterminateTags] = useState<TagOption[]>([]);
    const { tags, refetch: refetchTags } = useTags(tagType.name);
    const { createTag } = useTagApi();
    const tagsOptions = tags.map(({ value }) => ({ title: value }));
    const [payload, dispatch] = useReducer(payloadReducer, {
        addedTags: [],
        removedTags: [],
    });

    const resetTagType = (
        tagType: ITagType = tagTypes.length > 0 ? tagTypes[0] : emptyTagType
    ) => {
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
        dispatch({
            type: 'clear',
            payload: [],
        });
    };

    useEffect(() => {
        if (tagTypes.length > 0) {
            resetTagType();
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
            resetTagType(value);
        }
    };

    const createNewTagOnTheFly = (value: string, type: string) =>
        createTag({
            value,
            type,
        }).then(async () => {
            await refetchTags();
            setSelectedTags(prev => [...prev, { title: value }]);
            dispatch({
                type: 'add',
                payload: { value, type },
            });
        });

    const handleInputChange: AutocompleteProps<
        TagOption,
        true,
        false,
        false
    >['onChange'] = (_event, newValue, reason, selected) => {
        if (reason === 'selectOption') {
            newValue.forEach(value => {
                if (
                    typeof value !== 'string' &&
                    typeof value.inputValue === 'string' &&
                    value.inputValue &&
                    value.title.startsWith('Create new value')
                ) {
                    return createNewTagOnTheFly(value.inputValue, tagType.name);
                }

                setSelectedTags(newValue as TagOption[]);
                setIndeterminateTags((prev: TagOption[]) =>
                    prev.filter(({ title }) => title !== value.title)
                );
                if (selected?.option) {
                    dispatch({
                        type: 'add',
                        payload: {
                            value: selected.option.title,
                            type: tagType.name,
                        },
                    });
                }
            });
        } else if (reason === 'clear') {
            setSelectedTags([]);
            dispatch({
                type: 'clear',
                payload: initialValues,
            });
        } else if (reason === 'removeOption') {
            setSelectedTags(newValue as TagOption[]);
            if (selected?.option) {
                dispatch({
                    type: 'remove',
                    payload: {
                        value: selected.option.title,
                        type: tagType.name,
                    },
                });
            }
        }
    };

    const onClose = () => {
        resetTagType();
        onCancel();
    };

    return (
        <Dialogue
            open={open}
            secondaryButtonText="Cancel"
            primaryButtonText="Save tags"
            title="Update tags to feature toggle"
            onClick={() => onSubmit(payload)}
            disabledPrimaryButton={
                payload.addedTags.length === 0 &&
                payload.removedTags.length === 0
            }
            onClose={onClose}
            formId={formId}
        >
            <Typography
                paragraph
                sx={{ marginBottom: theme => theme.spacing(2.5) }}
            >
                Tags allow you to group features together
            </Typography>
            <form id={formId} onSubmit={() => onSubmit(payload)}>
                <StyledDialogFormContent>
                    <TagTypeSelect
                        key={tagTypesLoading ? 'loading' : tagTypes.length}
                        options={tagTypes}
                        disabled={tagTypesLoading || tagTypes.length === 0}
                        value={tagType}
                        onChange={handleTagTypeChange}
                    />
                    <ConditionallyRender
                        condition={!tagTypesLoading && tagTypes.length === 0}
                        show={
                            <Typography variant="body1">
                                No{' '}
                                <Link component={RouterLink} to="/tag-types">
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
        </Dialogue>
    );
};
