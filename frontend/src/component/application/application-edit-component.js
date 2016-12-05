import React, { PureComponent } from 'react';

import { Link } from 'react-router';
import { Grid, Cell } from 'react-mdl';

class ClientStrategies extends PureComponent {

    componentDidMount () {
        this.props.fetchApplication(this.props.appName);
    }

    render () {
        if (!this.props.application) {
            return <div>Loading application info...</div>;
        }
        const {
            appName,
            instances,
            strategies,
            seenToggles,
        } = this.props.application;

        return (
            <div>
                <h5>{appName}</h5>
                <Grid>
                    <Cell col={4}>
                        <h6>Instances</h6>
                        <ol className="demo-list-item mdl-list">
                        {instances.map(({ instanceId }, i) => <li className="mdl-list__item" key={i}>{instanceId}</li>)}
                        </ol>
                    </Cell>
                    <Cell col={4}>
                        <h6>Implemented strategies</h6>
                        <ol className="demo-list-item mdl-list">
                            {strategies.map((name, i) => (
                                <li className="mdl-list__item" key={`${name}-${i}`}>
                                    <Link to={`/strategies/view/${name}`}>
                                        {name}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </Cell>
                    <Cell col={4}>
                        <h6>Toggles</h6>
                        <ol className="demo-list-item mdl-list">
                        {seenToggles.map((name, i) => <li className="mdl-list__item"  key={i}>
                            <Link to={`/features/edit/${name}`}>
                                {name}
                            </Link>
                        </li>)}
                        </ol>
                    </Cell>
                </Grid>
            </div>
        );
    }
}


export default ClientStrategies;
