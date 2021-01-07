import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Card, CardTitle, CardActions } from 'react-mdl';
import { FormButtons, styles as commonStyles } from '../common';
import TagTypeSelect from '../feature/tag-type-select-container';
import { trim } from '../common/util';
class AddTagComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tag: props.tag,
            errors: {},
            dirty: false,
            currentLegalValue: '',
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (!state.tag.id && props.tag.id) {
            return { tag: props.tag };
        } else {
            return null;
        }
    }

    setValue = (field, value) => {
        const { tag } = this.state;
        tag[field] = value;
        this.setState({ tag, dirty: true });
    };

    onCancel = evt => {
        evt.preventDefault();
        this.props.history.push('/tags');
    };

    onSubmit = async evt => {
        evt.preventDefault();
        const { tag } = this.state;
        if (!tag.type || tag.type === '') {
            tag.type = 'simple';
        }
        try {
            await this.props.submit(tag);
            this.props.history.push('/tags');
        } catch (e) {
            this.setState({
                errors: {
                    general: e.message,
                },
            });
        }
    };

    render() {
        const { tag, errors } = this.state;
        const submitText = 'Create';
        return (
            <Card shadow={0} className={commonStyles.fullWidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', paddingBottom: '0', wordBreak: 'break-all' }}>
                    {submitText} Tag
                </CardTitle>
                <form onSubmit={this.onSubmit}>
                    <section style={{ padding: '16px' }}>
                        <p style={{ color: 'red' }}>{errors.general}</p>
                        <TagTypeSelect
                            name="type"
                            value={tag.type}
                            onChange={v => this.setValue('type', v.target.value)}
                        />
                        <Textfield
                            floatingLabel
                            label="Value"
                            name="value"
                            placeholder="Your tag"
                            value={tag.value}
                            error={errors.value}
                            onChange={v => this.setValue('value', trim(v.target.value))}
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

AddTagComponent.propTypes = {
    tag: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default AddTagComponent;
