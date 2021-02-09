import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Button, Textfield, DialogActions } from 'react-mdl';
import { FormButtons } from '../common';
import TagTypeSelect from '../feature/tag-type-select-container';
import { trim, modalStyles } from '../common/util';

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
        this.setState({ openDialog: false, tag: { type: 'simple', value: '' } });
    };
    onSubmit = async evt => {
        evt.preventDefault();
        const { tag } = this.state;
        if (!tag.type) {
            tag.type = 'simple';
        }
        try {
            await this.props.submit(this.props.featureToggleName, tag);
            this.setState({ openDialog: false, tag: { type: 'simple', value: '' } });
        } catch (e) {
            this.setState({ errors: { general: e.message } });
        }
    };
    render() {
        const { tag, errors, openDialog } = this.state;
        const submitText = 'Tag feature';
        return (
            <React.Fragment>
                <Button colored onClick={this.handleOpenDialog.bind(this)} ripple>
                    Add tag
                </Button>
                <Modal
                    isOpen={openDialog}
                    contentLabel="Add tags to feature toggle"
                    style={modalStyles}
                    onRequestClose={this.onCancel}
                >
                    <h3>{submitText}</h3>
                    <p>Tags allows you to group features together</p>
                    <form onSubmit={this.onSubmit}>
                        <section>
                            <TagTypeSelect
                                name="type"
                                value={tag.type}
                                onChange={v => this.setValue('type', v.target.value)}
                            />
                            <br />
                            <Textfield
                                floatingLabel
                                label="Value"
                                name="value"
                                placeholder="Your tag"
                                value={tag.value}
                                error={errors.value}
                                onChange={v => this.setValue('value', v.target.value)}
                            />
                        </section>
                        {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
                        <DialogActions>
                            <FormButtons submitText={submitText} onCancel={this.onCancel} />
                        </DialogActions>
                    </form>
                </Modal>
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
