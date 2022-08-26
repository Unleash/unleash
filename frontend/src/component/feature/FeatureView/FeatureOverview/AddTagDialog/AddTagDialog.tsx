import { Typography } from '@mui/material';
import React, { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { useStyles } from './AddTagDialog.styles';
import { trim } from 'component/common/util';
import TagSelect from 'component/common/TagSelect/TagSelect';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useTags from 'hooks/api/getters/useTags/useTags';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

interface IAddTagDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IDefaultTag {
    type: string;
    value: string;

    [index: string]: string;
}

const AddTagDialog = ({ open, setOpen }: IAddTagDialogProps) => {
    const DEFAULT_TAG: IDefaultTag = { type: 'simple', value: '' };
    const { classes: styles } = useStyles();
    const featureId = useRequiredPathParam('featureId');
    const { addTagToFeature, loading } = useFeatureApi();
    const { refetch } = useTags(featureId);
    const [errors, setErrors] = useState({ tagError: '' });
    const { setToastData } = useToast();
    const [tag, setTag] = useState(DEFAULT_TAG);

    const onCancel = () => {
        setOpen(false);
        setErrors({ tagError: '' });
        setTag(DEFAULT_TAG);
    };

    const setValue = (field: string, value: string) => {
        const newTag = { ...tag };
        newTag[field] = trim(value);
        setTag(newTag);
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

    const formId = 'add-tag-form';

    return (
        <>
            <Dialogue
                open={open}
                secondaryButtonText="Cancel"
                primaryButtonText="Add tag"
                title="Add tags to feature toggle"
                onClick={onSubmit}
                disabledPrimaryButton={loading}
                onClose={onCancel}
                formId={formId}
            >
                <>
                    <Typography paragraph>
                        Tags allow you to group features together
                    </Typography>
                    <form id={formId} onSubmit={onSubmit}>
                        <section className={styles.dialogFormContent}>
                            <TagSelect
                                autoFocus
                                name="type"
                                value={tag.type}
                                onChange={type => setValue('type', type)}
                            />
                            <br />
                            <Input
                                label="Value"
                                name="value"
                                placeholder="Your tag"
                                value={tag.value}
                                error={Boolean(errors.tagError)}
                                errorText={errors.tagError}
                                onChange={e =>
                                    setValue('value', e.target.value)
                                }
                            />
                        </section>
                    </form>
                </>
            </Dialogue>
        </>
    );
};

export default AddTagDialog;
