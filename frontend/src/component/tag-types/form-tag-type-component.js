import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { FormButtons } from '../common';
import PageContent from '../common/PageContent/PageContent';
import { Typography, TextField } from '@material-ui/core';

import styles from './TagType.module.scss';
import commonStyles from '../common/common.module.scss';
import AccessContext from '../../contexts/AccessContext';
import { CREATE_TAG_TYPE, UPDATE_TAG_TYPE } from '../AccessProvider/permissions';
import ConditionallyRender from '../common/ConditionallyRender';

const AddTagTypeComponent = ({ tagType, validateName, submit, history, editMode }) => {
    const [tagTypeName, setTagTypeName] = useState(tagType.name || '');
    const [tagTypeDescription, setTagTypeDescription] = useState(tagType.description || '');
    const [errors, setErrors] = useState({
        general: undefined,
        name: undefined,
        description: undefined,
    });
    const { hasAccess } = useContext(AccessContext);

    const onValidateName = async evt => {
        evt.preventDefault();
        const name = evt.target.value;
        try {
            await validateName(name);
            setErrors({ name: undefined });
        } catch (err) {
            setErrors({ name: err.message });
        }
    };

    const onCancel = evt => {
        evt.preventDefault();
        history.push('/tag-types');
    };

    const onSubmit = async evt => {
        evt.preventDefault();
        try {
            await submit({
                name: tagTypeName,
                description: tagTypeDescription,
            });
            history.push('/tag-types');
        } catch (e) {
            setErrors({ general: e.message });
        }
    };
    const submitText = editMode ? 'Update' : 'Create';
    return (
        <PageContent headerContent={`${submitText} Tag type`}>
            <section className={classnames(commonStyles.contentSpacing, styles.tagTypeContainer)}>
                <Typography variant="subtitle1">
                    Tag types allows you to group tags together in the management UI
                </Typography>
                <form onSubmit={onSubmit} className={classnames(styles.addTagTypeForm, commonStyles.contentSpacing)}>
                    <TextField
                        label="Name"
                        name="name"
                        placeholder="url-friendly-unique-name"
                        value={tagTypeName}
                        error={errors.name !== undefined}
                        helperText={errors.name}
                        disabled={editMode}
                        onBlur={onValidateName}
                        onChange={v => setTagTypeName(v.target.value.trim())}
                        variant="outlined"
                        size="small"
                    />
                    <TextField
                        label="Description"
                        name="description"
                        placeholder="Some short explanation of the tag type"
                        rowsMax={4}
                        multiline
                        error={errors.description !== undefined}
                        helperText={errors.description}
                        value={tagTypeDescription}
                        onChange={v => setTagTypeDescription(v.target.value)}
                        variant="outlined"
                        size="small"
                    />
                    <ConditionallyRender condition={hasAccess(editMode ? UPDATE_TAG_TYPE : CREATE_TAG_TYPE)} show={
                        <div className={styles.formButtons}>
                            <FormButtons submitText={submitText} onCancel={onCancel} />
                        </div>
                    } elseShow={<span>You do not have permissions to save.</span>} />
                </form>
            </section>
        </PageContent>
    );
};

AddTagTypeComponent.propTypes = {
    tagType: PropTypes.object.isRequired,
    validateName: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default AddTagTypeComponent;
