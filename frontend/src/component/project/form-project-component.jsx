import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Card, CardTitle, CardText, CardActions } from 'react-mdl';

import { FormButtons, styles as commonStyles } from '../common';
import { trim } from '../common/util';

class AddContextComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            project: props.project,
            errors: {},
            currentLegalValue: '',
            dirty: false,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (!state.project.id && props.project.id) {
            return { project: props.project };
        } else {
            return null;
        }
    }

    setValue = (field, value) => {
        const { project } = this.state;
        project[field] = value;
        this.setState({ project, dirty: true });
    };

    validateId = async id => {
        const { errors } = this.state;
        const { validateId } = this.props;
        try {
            await validateId(id);
            errors.id = undefined;
        } catch (err) {
            errors.id = err.message;
        }

        this.setState({ errors });
    };

    onCancel = evt => {
        evt.preventDefault();
        this.props.history.push('/projects');
    };

    onSubmit = async evt => {
        evt.preventDefault();
        const { project } = this.state;
        await this.props.submit(project);
        this.props.history.push('/projects');
    };

    render() {
        const { project, errors } = this.state;
        const { editMode } = this.props;
        const submitText = editMode ? 'Update' : 'Create';

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', paddingBottom: '0', wordBreak: 'break-all' }}>
                    {submitText} Project
                </CardTitle>
                <CardText>Projects allows you to group feature toggles together in the managemnt UI.</CardText>
                <form onSubmit={this.onSubmit}>
                    <section style={{ padding: '16px' }}>
                        <Textfield
                            floatingLabel
                            label="Project Id"
                            name="id"
                            placeholder="A-unique-key"
                            value={project.id}
                            error={errors.id}
                            disabled={editMode}
                            onBlur={v => this.validateId(v.target.value)}
                            onChange={v => this.setValue('id', trim(v.target.value))}
                        />
                        <br />
                        <Textfield
                            floatingLabel
                            label="Name"
                            name="name"
                            placeholder="Project name"
                            value={project.name}
                            error={errors.name}
                            onChange={v => this.setValue('name', v.target.value)}
                        />
                        <Textfield
                            floatingLabel
                            style={{ width: '100%' }}
                            placeholder="A short description"
                            rows={1}
                            label="Description"
                            error={errors.description}
                            value={project.description}
                            onChange={v => this.setValue('description', v.target.value)}
                        />
                    </section>
                    <CardActions>
                        <FormButtons submitText={submitText} onCancel={this.onCancel} />
                    </CardActions>
                </form>
            </Card>
        );
    }
}

AddContextComponent.propTypes = {
    project: PropTypes.object.isRequired,
    validateId: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default AddContextComponent;
