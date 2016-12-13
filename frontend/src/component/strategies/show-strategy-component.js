import React, { Component } from 'react';
import { Grid, Cell, List, ListItem, ListItemContent } from 'react-mdl';
import { AppsLinkList, TogglesLinkList, HeaderTitle } from '../common';

class ShowStrategyComponent extends Component {
    componentDidMount () {
        if (!this.props.strategy) {
            this.props.fetchStrategies();
        };
        if (!this.props.applications || this.props.applications.length === 0) {
            this.props.fetchApplications();
        }
        if (!this.props.toggles || this.props.toggles.length === 0) {
            this.props.fetchFeatureToggles();
        }
    }

    renderParameters (params) {
        if (params) {
            return params.map(({ name, type, description, required }, i) => (
                <ListItem twoLine key={`${name}-${i}`} title={required ? 'Required' : ''}>
                    <ListItemContent avatar={required ? 'add' : ' '} subtitle={description}>
                        {name} <small>({type})</small>
                    </ListItemContent>
                </ListItem>
            ));
        } else {
            return <ListItem>(no params)</ListItem>;
        }
    }

    render () {
        const {
            strategy,
            strategyName,
            applications,
            toggles,
        } = this.props;

        if (!strategy) {
            return <div>Cannot find Strategy "{strategyName}".</div>;
        }

        const {
            name,
            description,
            parameters = [],
        } = strategy;

        return (
            <div>
                <HeaderTitle title={name} subtitle={description} />
                <Grid>
                    <Cell col={12}>
                        <h6>Parameters</h6>
                        <hr />
                        <List>
                            {this.renderParameters(parameters)}
                        </List>
                    </Cell>

                    <Cell col={6}>
                        <h6>Applications using this strategy</h6>
                        <hr />
                        <AppsLinkList apps={applications} />
                    </Cell>

                    <Cell col={6}>
                        <h6>Toggles using this strategy</h6>
                        <hr />
                        <TogglesLinkList toggles={toggles} />
                    </Cell>
                </Grid>
            </div>
        );
    }
}


export default ShowStrategyComponent;
