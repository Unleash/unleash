import { styled, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { trim } from 'component/common/util';
import TagSelect from 'component/common/TagSelect/TagSelect';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useTags from 'hooks/api/getters/useTags/useTags';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ITag } from 'interfaces/tags';

const StyledInput = styled(Input)(() => ({
    width: '100%',
}));

interface IAddTagDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IDefaultTag {
    type: string;
    value: string;

    [index: string]: string;
}

const StyledDialogFormContent = styled('section')(({ theme }) => ({
    ['& > *']: {
        margin: '0.5rem 0',
    },
}));

const AddTagDialog = ({ open, setOpen }: IAddTagDialogProps) => {
    const DEFAULT_TAG: IDefaultTag = { type: 'simple', value: '' };
    const featureId = useRequiredPathParam('featureId');
    const { addTagToFeature, loading } = useFeatureApi();
    const { tags, refetch } = useTags(featureId);
    const [errors, setErrors] = useState({ tagError: '' });
    const { setToastData } = useToast();
    const [tag, setTag] = useState(DEFAULT_TAG);

    const onCancel = () => {
        setOpen(false);
        setErrors({ tagError: '' });
        setTag(DEFAULT_TAG);
    };

    const onSubmit = async (evt: React.SyntheticEvent) => {
        evt.preventDefault();
        if (!tag.type) {
            tag.type = 'simple';
        }
        try {
            await addTagToFeature(featureId, tag);

            setOpen(false);
            setTag(DEFAULT_TAG);
            refetch();
            setToastData({
                type: 'success',
                title: 'Added tag to toggle',
                text: 'We successfully added a tag to your toggle',
                confetti: true,
            });
        } catch (error: unknown) {
            const message = formatUnknownError(error);
            setErrors({ tagError: message });
        }
    };

    const isValueNotEmpty = (name: string) => name.length;
    const isTagUnique = (tag: ITag) =>
        !tags.some(
            ({ type, value }) => type === tag.type && value === tag.value
        );
    const isValid = isValueNotEmpty(tag.value) && isTagUnique(tag);

    const onUpdateTag = (key: string, value: string) => {
        setErrors({ tagError: '' });
        const updatedTag = { ...tag, [key]: trim(value) };

        if (!isTagUnique(updatedTag)) {
            setErrors({
                tagError: 'Tag already exists for this feature toggle.',
            });
        }

        setTag(updatedTag);
    };

    const formId = 'add-tag-form';

    return (
        <>
            <Dialogue
                open={open}
                secondaryButtonText="Cancel"
                primaryButtonText="Add tag"
                title="Add tags to feature toggle"
                onClick={onSubmit}
                disabledPrimaryButton={loading || !isValid}
                onClose={onCancel}
                formId={formId}
            >
                <>
                    <Typography paragraph>
                        Tags allow you to group features together
                    </Typography>
                    <form id={formId} onSubmit={onSubmit}>
                        <StyledDialogFormContent>
                            <TagSelect
                                autoFocus
                                name="type"
                                value={tag.type}
                                onChange={type => onUpdateTag('type', type)}
                            />
                            <br />
                            <StyledInput
                                label="Value"
                                name="value"
                                placeholder="Your tag"
                                value={tag.value}
                                error={Boolean(errors.tagError)}
                                errorText={errors.tagError}
                                onChange={e =>
                                    onUpdateTag('value', e.target.value)
                                }
                                required
                            />
                        </StyledDialogFormContent>
                    </form>
                </>
            </Dialogue>
        </>
    );
};

export default AddTagDialog;
