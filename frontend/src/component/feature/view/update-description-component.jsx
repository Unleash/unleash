import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    Typography,
    IconButton,
    FormControl,
    TextField,
    Button,
} from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';

import styles from './update-description-component.module.scss';

export default class UpdateDescriptionComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editMode: false };
    }

    static propTypes = {
        isFeatureView: PropTypes.bool.isRequired,
        update: PropTypes.func,
        featureToggle: PropTypes.object,
        editable: PropTypes.bool,
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

    renderRead({ description, editable }) {
        return (
            <FormControl size="small" variant="outlined">
                <Typography>
                    {description || 'No feature toggle description'}
                    <ConditionallyRender
                        condition={editable}
                        show={
                            <IconButton
                                aria-label="toggle description edit"
                                to="#edit"
                                component={Link}
                                onClick={this.onEditMode.bind(
                                    this,
                                    description
                                )}
                            >
                                <CreateIcon />
                            </IconButton>
                        }
                    />
                </Typography>
            </FormControl>
        );
    }

    renderEdit() {
        const { description } = this.state;
        return (
            <div>
                <TextField
                    className={styles.descriptionInput}
                    label="Description"
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                    value={description}
                    onChange={this.updateValue}
                />
                <div style={{ marginTop: '0.5rem' }}>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        onClick={this.onSave}
                    >
                        Save
                    </Button>
                    &nbsp;
                    <Button type="cancel" onClick={this.onCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    render() {
        const { editMode } = this.state;
        return editMode
            ? this.renderEdit(this.props)
            : this.renderRead(this.props);
    }
}
