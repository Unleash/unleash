import React, { Component } from 'react';
import { Grid, Cell } from 'react-mdl';

import { AppsLinkList } from '../common';

class ShowStrategyComponent extends Component {
    componentDidMount () {
        if (!this.props.strategy) {
            this.props.fetchStrategies();
        };
        if (!this.props.applications || this.props.applications.length === 0) {
            this.props.fetchApplications();
        }
    }

    renderParameters (parametersTemplate) {
        if (parametersTemplate) {
            return Object.keys(parametersTemplate).map((name, i) => (
                <li key={`${name}-${i}`}><strong>{name}</strong> ({parametersTemplate[name]})</li>
            ));
        } else {
            return <li>(no params)</li>;
        }
    }

    render () {
        const {
            strategy,
            strategyName,
            applications,
        } = this.props;

        if (!strategy) {
            return <div>Cannot find Strategy "{strategyName}".</div>;
        }

        const {
            name,
            description,
            parametersTemplate = {},
        } = strategy;


        return (
            <div>
                <h4>{name}</h4>
                <p>{description}</p>
                <Grid>
                    <Cell col={6}>
                        <h6>Parameters</h6>
                        <hr />
                        <ol className="demo-list-item mdl-list">
                            {this.renderParameters(parametersTemplate)}
                        </ol>
                    </Cell>

                    <Cell col={6}>
                        <h6>Applications using this strategy</h6>
                        <hr />
                        <AppsLinkList apps={applications} />
                    </Cell>
                </Grid>
            </div>
        );
    }
}


export default ShowStrategyComponent;
