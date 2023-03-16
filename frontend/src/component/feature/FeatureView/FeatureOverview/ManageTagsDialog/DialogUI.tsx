import { useEffect, useState, VFC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AutocompleteProps, Link, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { TagTypeSelect } from './TagTypeSelect';
import { TagOption, TagsInput } from './TagsInput';
import useTags from 'hooks/api/getters/useTags/useTags';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';
import { ITagType } from 'interfaces/tags';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IDialogUIProps {
    open: boolean;
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
    onCancel,
    onSubmit,
}) => {
    const { tagTypes, loading: tagTypesLoading } = useTagTypes();
    const [tagType, setTagType] = useState<typeof tagTypes[0]>({
        name: '',
        description: '',
        icon: '',
    });
    const { tags } = useTags(tagType.name);
    const tagsOptions = tags.map(({ value }) => ({ title: value }));

    useEffect(() => {
        if (tagTypes.length > 0) {
            setTagType(tagTypes[0]);
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
            setTagType(value);
        }
    };

    const handleInputChange: AutocompleteProps<
        TagOption | string,
        true,
        any,
        any
    >['onChange'] = (...props) => {
        console.log('handleInputChange', props);
        // FIXME: change value
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
                            key={tagTypesLoading ? 'loading' : 'loaded'}
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
                                <>
                                    <TagsInput
                                        disabled={tagTypesLoading}
                                        options={tagsOptions}
                                        existingTags={tags}
                                        tagType={tagType}
                                        selectedOptions={[]}
                                        onChange={handleInputChange}
                                    />
                                </>
                            }
                        />
                    </StyledDialogFormContent>
                </form>
            </>
        </Dialogue>
    );
};
