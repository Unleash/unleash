import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { Button, Icon, Textfield, Checkbox, Card, CardTitle, CardActions } from 'react-mdl';

import { styles as commonStyles } from '../../common';

import { trim } from './util';

class CopyFeatureComponent extends Component {
    // static displayName = `AddFeatureComponent-${getDisplayName(Component)}`;

    constructor() {
        super();
        this.state = { newToggleName: '', replaceGroupId: true };
    }

    componentWillMount() {
        // TODO unwind this stuff
        if (this.props.copyToggle) {
            this.setState({ featureToggle: this.props.copyToggle });
        }
    }

    componentDidMount() {
        if (this.props.copyToggle) {
            this.refs.name.inputRef.focus();
        } else {
            this.props.fetchFeatureToggles();
        }
    }

    setValue = evt => {
        const value = trim(evt.target.value);
        this.setState({ newToggleName: value });
    };

    toggleReplaceGroupId = () => {
        const { replaceGroupId } = !!this.state;
        this.setState({ replaceGroupId });
    };

    onValidateName = async () => {
        const { newToggleName } = this.state;
        try {
            await this.props.validateName(newToggleName);
            this.setState({ nameError: undefined });
        } catch (err) {
            this.setState({ nameError: err.message });
        }
    };

    onSubmit = evt => {
        evt.preventDefault();

        const { nameError, newToggleName, replaceGroupId } = this.state;
        if (nameError) {
            return;
        }

        const { copyToggle, history } = this.props;

        copyToggle.name = newToggleName;

        if (replaceGroupId) {
            copyToggle.strategies.forEach(s => {
                if (s.parameters && s.parameters.groupId) {
                    s.parameters.groupId = newToggleName;
                }
            });
        }

        this.props.createFeatureToggle(copyToggle).then(() => history.push(`/features/strategies/${copyToggle.name}`));
    };

    render() {
        const { copyToggle } = this.props;

        if (!copyToggle) return <span>Toggle not found</span>;

        const { newToggleName, nameError, replaceGroupId } = this.state;

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', wordBreak: 'break-all' }}>
                    Copy&nbsp;{copyToggle.name}
                </CardTitle>

                <form onSubmit={this.onSubmit}>
                    <section style={{ padding: '16px' }}>
                        <p>
                            You are about to create a new feature toggle by cloning the configuration of feature
                            toggle&nbsp;
                            <Link to={`/features/strategies/${copyToggle.name}`}>{copyToggle.name}</Link>. You must give
                            the new feature toggle a unique name before you can proceed.
                        </p>
                        <Textfield
                            floatingLabel
                            label="Feature toggle name"
                            name="name"
                            value={newToggleName}
                            error={nameError}
                            onBlur={this.onValidateName}
                            onChange={this.setValue}
                            ref="name"
                        />
                        <br />
                        <br />
                        <Checkbox
                            checked={replaceGroupId}
                            label="Replace groupId"
                            onChange={this.toggleReplaceGroupId}
                        />
                        <br />
                    </section>
                    <CardActions>
                        <Button type="submit" ripple raised primary>
                            <Icon name="file_copy" />
                            &nbsp;&nbsp;&nbsp; Copy feature toggle
                        </Button>
                        <br />
                    </CardActions>
                </form>
            </Card>
        );
    }
}

CopyFeatureComponent.propTypes = {
    copyToggle: PropTypes.object,
    history: PropTypes.object.isRequired,
    createFeatureToggle: PropTypes.func.isRequired,
    fetchFeatureToggles: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
};

export default CopyFeatureComponent;
