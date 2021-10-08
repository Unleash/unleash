import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DialogContentText, Button, TextField } from '@material-ui/core';
import Dialogue from '../common/Dialogue';
import { trim } from '../common/util';
import TagSelect from '../common/TagSelect/TagSelect';

import styles from './add-tag-dialog-component.module.scss';

class AddTagDialogComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            errors: {},
            currentLegalValue: '',
            dirty: false,
            featureToggleName: props.featureToggleName,
            tag: props.tag,
        };
    }

    handleOpenDialog() {
        this.setState({ openDialog: true });
    }
    handleCancel() {
        this.setState({
            openDialog: false,
            tag: { type: 'simple', value: '' },
        });
    }

    setValue = (field, value) => {
        const { tag } = this.state;
        tag[field] = trim(value);
        this.setState({ tag, dirty: true });
    };

    onCancel = evt => {
        evt.preventDefault();
        this.setState({
            openDialog: false,
            tag: { type: 'simple', value: '' },
        });
    };
    onSubmit = async evt => {
        evt.preventDefault();
        const { tag } = this.state;
        if (!tag.type) {
            tag.type = 'simple';
        }
        try {
            await this.props.submit(this.props.featureToggleName, tag);
            this.setState({
                openDialog: false,
                tag: { type: 'simple', value: '' },
            });
        } catch (e) {
            this.setState({ errors: { general: e.message } });
        }
    };
    render() {
        const { tag, errors, openDialog } = this.state;
        return (
            <React.Fragment>
                <Button onClick={this.handleOpenDialog.bind(this)}>
                    Add tag
                </Button>

                <Dialogue
                    open={openDialog}
                    secondaryButtonText="Cancel"
                    primaryButtonText="Add tag"
                    title="Add tags to feature toggle"
                    onClick={this.onSubmit}
                    onClose={this.onCancel}
                >
                    <>
                        <DialogContentText>
                            Tags allows you to group features together
                        </DialogContentText>
                        <form onSubmit={this.onSubmit}>
                            <section className={styles.dialogueFormContent}>
                                <TagSelect
                                    name="type"
                                    value={tag.type}
                                    onChange={v =>
                                        this.setValue('type', v.target.value)
                                    }
                                />
                                <br />
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    label="Value"
                                    name="value"
                                    placeholder="Your tag"
                                    value={tag.value}
                                    error={errors.value}
                                    onChange={v =>
                                        this.setValue('value', v.target.value)
                                    }
                                />
                            </section>
                            {errors.general && (
                                <p style={{ color: 'red' }}>{errors.general}</p>
                            )}
                        </form>
                    </>
                </Dialogue>
            </React.Fragment>
        );
    }
}

AddTagDialogComponent.propTypes = {
    featureToggleName: PropTypes.string.isRequired,
    tag: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
};

export default AddTagDialogComponent;
