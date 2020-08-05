import React from 'react';
import PropTypes from 'prop-types';
import { Button, Textfield } from 'react-mdl';

import { UPDATE_FEATURE } from '../../../permissions';

export default class UpdateDescriptionComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editMode: false };
    }

    static propTypes = {
        isFeatureView: PropTypes.bool.isRequired,
        update: PropTypes.func,
        featureToggle: PropTypes.object,
        hasPermission: PropTypes.func.isRequired,
    };

    onEditMode = (description, evt) => {
        evt.preventDefault();
        this.setState({ editMode: true, description });
    };

    updateValue = evt => {
        evt.preventDefault();
        this.setState({ description: evt.target.value });
    };

    onSave = evt => {
        evt.preventDefault();
        this.props.update(this.state.description);
        this.setState({ editMode: false, description: undefined });
    };

    onCancel = evt => {
        evt.preventDefault();
        this.setState({ editMode: false, description: undefined });
    };

    renderRead({ description, isFeatureView, hasPermission }) {
        return (
            <div>
                {description}&nbsp;
                {isFeatureView && hasPermission(UPDATE_FEATURE) ? (
                    <a href="#edit" onClick={this.onEditMode.bind(this, description)}>
                        edit
                    </a>
                ) : null}
            </div>
        );
    }

    renderEdit() {
        const { description } = this.state;
        return (
            <div>
                <Textfield
                    floatingLabel
                    style={{ width: '100%' }}
                    label="Description"
                    required
                    value={description}
                    onChange={this.updateValue}
                />
                <div>
                    <Button type="submit" raised accent onClick={this.onSave}>
                        Save
                    </Button>
                    &nbsp;
                    <Button type="cancel" raised onClick={this.onCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    render() {
        const { editMode } = this.state;
        return editMode ? this.renderEdit(this.props) : this.renderRead(this.props);
    }
}
