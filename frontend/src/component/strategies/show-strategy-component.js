import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Tooltip,
} from '@material-ui/core';
import { Add, RadioButtonChecked } from '@material-ui/icons';

import { TogglesLinkList } from './toggles-link-list';
import { AppsLinkList } from '../common';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';
import styles from './strategies.module.scss';

class ShowStrategyComponent extends PureComponent {
    static propTypes = {
        toggles: PropTypes.array,
        applications: PropTypes.array,
        strategy: PropTypes.object.isRequired,
    };

    renderParameters(params) {
        if (params) {
            return params.map(({ name, type, description, required }, i) => (
                <ListItem key={`${name}-${i}`}>
                    <ConditionallyRender
                        condition={required}
                        show={
                            <Tooltip title="Required">
                                <ListItemAvatar>
                                    <Add />
                                </ListItemAvatar>
                            </Tooltip>
                        }
                        elseShow={
                            <Tooltip title="Optional">
                                <ListItemAvatar>
                                    <RadioButtonChecked />
                                </ListItemAvatar>
                            </Tooltip>
                        }
                    />
                    <ListItemText
                        primary={
                            <div>
                                {name} <small>({type})</small>
                            </div>
                        }
                        secondary={description}
                    />
                </ListItem>
            ));
        } else {
            return <ListItem>(no params)</ListItem>;
        }
    }

    render() {
        const { strategy, applications, toggles } = this.props;

        const { parameters = [] } = strategy;

        return (
            <div className={styles.listcontainer}>
                <Grid container>
                    <ConditionallyRender
                        condition={strategy.deprecated}
                        show={
                            <Grid item>
                                <h5 style={{ color: '#ff0000' }}>Deprecated</h5>
                            </Grid>
                        }
                    />
                    <Grid item sm={12} md={12}>
                        <h6>Parameters</h6>
                        <hr />
                        <List>{this.renderParameters(parameters)}</List>
                    </Grid>

                    <Grid item sm={12} md={6}>
                        <h6>Applications using this strategy</h6>
                        <hr />
                        <AppsLinkList apps={applications} />
                    </Grid>

                    <Grid item sm={12} md={6}>
                        <h6>Toggles using this strategy</h6>
                        <hr />
                        <TogglesLinkList toggles={toggles} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default ShowStrategyComponent;
