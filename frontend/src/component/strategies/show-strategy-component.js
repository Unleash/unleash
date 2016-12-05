import React, { Component } from 'react';
import { Link } from 'react-router';
import { Grid, Cell } from 'react-mdl';

class ShowStrategyComponent extends Component {
    constructor (props) {
        super(props);
        this.state = { applications: [] };
    }

    componentDidMount () {
        if (!this.props.strategy) {
            this.props.fetchStrategies();
        };

        this.props.getApplications()
            .then(res => this.setState({ applications: res.applications }));
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
        if (!this.props.strategy) {
            return null;
        }

        const {
            name,
            description,
            parametersTemplate = {},
        } = this.props.strategy;


        return (
            <div>
                <h4>{name}</h4>
                <p>{description}</p>
                <Grid>
                    <Cell col={4}>
                        <h6>Parameters</h6>
                        <ol className="demo-list-item mdl-list">
                            {this.renderParameters(parametersTemplate)}
                        </ol>
                    </Cell>

                    <Cell col={4}>
                        <h6>Applications using this strategy</h6>
                        <ol className="demo-list-item mdl-list">
                            {this.state.applications.map(({ appName }, i) => (
                                <li key={`${appName}-${i}`}>
                                    <Link to={`/applications/${appName}`}>
                                        {appName}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </Cell>

                </Grid>
            </div>
        );
    }
}


export default ShowStrategyComponent;
