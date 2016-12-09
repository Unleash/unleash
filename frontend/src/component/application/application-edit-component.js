/* eslint react/no-multi-comp:off */
import React, { Component, PureComponent } from 'react';

import { Link } from 'react-router';
import { Grid, Cell, List, ListItem, ListItemContent, Textfield, Icon } from 'react-mdl';


class StatefulTextfield extends Component {
    constructor (props) {
        super(props);
        this.state = { value: props.value };
        this.setValue = function setValue (e) {
            this.setState({ value: e.target.value });
        }.bind(this);
    }

    render () {
        return (<Textfield label={this.props.label}
            floatingLabel
            rows={this.props.rows}
            value={this.state.value}
            onChange={this.setValue}
            onBlur={this.props.onBlur} />
        );
    }
}

class ClientStrategies extends PureComponent {
    componentDidMount () {
        this.props.fetchApplication(this.props.appName);
    }

    render () {
        if (!this.props.application) {
            return <div>Loading application info...</div>;
        }
        const {
            application,
            storeApplicationMetaData,
        } = this.props;
        const {
            appName,
            instances,
            strategies,
            seenToggles,
            data = {},
        } = application;

        return (
            <div>
                <h5><Icon name={data.icon || 'apps'} /> {appName}</h5>
                {data.description && <p>{data.description} </p>}
                <Grid>
                    <Cell col={3}>
                        <h6> Toggles</h6>
                        <hr />
                        <List>
                        {seenToggles.map((name, i) =>
                            <ListItem key={i}>
                                <ListItemContent icon="check box">
                                    <Link to={`/features/edit/${name}`}>
                                        {name}
                                    </Link>
                                </ListItemContent>
                        </ListItem>)}
                        </List>
                    </Cell>
                    <Cell col={3}>
                        <h6>Implemented strategies</h6>
                        <hr />
                        <List>
                            {strategies.map((name, i) => (
                                <ListItem key={`${name}-${i}`}>
                                    <ListItemContent icon="toc">
                                        <Link to={`/strategies/view/${name}`}>
                                            {name}
                                        </Link>
                                    </ListItemContent>
                                </ListItem>
                            ))}
                        </List>
                    </Cell>
                    <Cell col={6}>
                        <h6>{instances.length} Instances connected</h6>
                        <hr />
                        <List>
                        {instances.map(({ instanceId, clientIp, lastSeen }, i) => (
                            <ListItem key={i} twoLine>
                                <ListItemContent icon="timeline" subtitle={<span>{clientIp} last seen at <small>{new Date(lastSeen).toLocaleString('nb-NO')}</small></span>}>
                                    {instanceId}
                                </ListItemContent>
                            </ListItem>
                        ))}
                        </List>
                    </Cell>

                    <Cell col={12}>
                        <h5>Edit app meta data</h5>
                    </Cell>
                    <Cell col={6}>
                        <StatefulTextfield value={data.url} label="URL" onBlur={(e) => storeApplicationMetaData(appName, 'url', e.target.value)} /><br />
                        <StatefulTextfield value={data.description} label="Description" rows={5} onBlur={(e) => storeApplicationMetaData(appName, 'description', e.target.value)} />
                    </Cell>
                    <Cell col={6}>
                        <StatefulTextfield value={data.icon} label="Select icon" onBlur={(e) => storeApplicationMetaData(appName, 'icon', e.target.value)} />
                        <StatefulTextfield value={data.color} label="Select color" onBlur={(e) => storeApplicationMetaData(appName, 'color', e.target.value)} />
                    </Cell>
                </Grid>
            </div>
        );
    }
}


export default ClientStrategies;
