import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Switch, Card, CardTitle, CardActions, Grid, Cell } from 'react-mdl';
import FeatureTypeSelect from '../feature-type-select-container';
import ProjectSelect from '../project-select-container';

import { FormButtons, styles as commonStyles } from '../../common';
import { trim } from '../../common/util';

class AddFeatureComponent extends Component {
    // static displayName = `AddFeatureComponent-${getDisplayName(Component)}`;
    componentDidMount() {
        window.onbeforeunload = () => 'Data will be lost if you leave the page, are you sure?';
    }

    componentWillUnmount() {
        window.onbeforeunload = false;
    }

    render() {
        const { input, errors, setValue, validateName, onSubmit, onCancel } = this.props;

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <CardTitle style={{ paddingTop: '24px', wordBreak: 'break-all' }}>Create new feature toggle</CardTitle>
                <form onSubmit={onSubmit}>
                    <Grid>
                        <Cell col={4}>
                            <Textfield
                                floatingLabel
                                style={{ width: '100%' }}
                                label="Name"
                                placeholder="Unique-name"
                                name="name"
                                value={input.name}
                                error={errors.name}
                                onBlur={v => validateName(v.target.value)}
                                onChange={v => setValue('name', trim(v.target.value))}
                            />
                        </Cell>
                        <Cell col={2}>
                            <FeatureTypeSelect value={input.type} onChange={v => setValue('type', v.target.value)} />
                        </Cell>
                        <Cell col={2} style={{ paddingTop: '14px' }}>
                            <Switch
                                checked={input.enabled}
                                onChange={() => {
                                    setValue('enabled', !input.enabled);
                                }}
                            >
                                {input.enabled ? 'Enabled' : 'Disabled'}
                            </Switch>
                        </Cell>
                    </Grid>
                    <section style={{ padding: '0 16px' }}>
                        <ProjectSelect value={input.project} onChange={v => setValue('project', v.target.value)} />
                    </section>
                    <section style={{ padding: '0 16px' }}>
                        <Textfield
                            floatingLabel
                            style={{ width: '100%' }}
                            rows={1}
                            label="Description"
                            placeholder="A short description of the feature toggle"
                            error={errors.description}
                            value={input.description}
                            onChange={v => setValue('description', v.target.value)}
                        />
                    </section>
                    <CardActions>
                        <FormButtons submitText={'Create'} onCancel={onCancel} />
                    </CardActions>
                </form>
            </Card>
        );
    }
}

AddFeatureComponent.propTypes = {
    input: PropTypes.object,
    errors: PropTypes.object,
    setValue: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
    initCallRequired: PropTypes.bool,
    init: PropTypes.func,
};

export default AddFeatureComponent;
