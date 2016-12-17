/* eslint react/no-multi-comp:off */
import React, { Component, PureComponent } from 'react';

import { Link } from 'react-router';
import {
    Grid, Cell,
    List, ListItem, ListItemContent,
    Textfield, Icon, ProgressBar,
    Tabs, Tab,
    Switch,
} from 'react-mdl';
import { HeaderTitle, ExternalIconLink } from '../common';

class StatefulTextfield extends Component {
    constructor (props) {
        super(props);
        this.state = { value: props.value };
        this.setValue = function setValue (e) {
            this.setState({ value: e.target.value });
        }.bind(this);
    }

    render () {
        return (<Textfield
            style={{ width: '100%' }}
            label={this.props.label}
            floatingLabel
            rows={this.props.rows}
            value={this.state.value}
            onChange={this.setValue}
            onBlur={this.props.onBlur} />
        );
    }
}

class ClientApplications extends PureComponent {
    constructor (props) {
        super(props);
        this.state = { activeTab: 0 };
    }

    componentDidMount () {
        this.props.fetchApplication(this.props.appName);
    }

    render () {
        if (!this.props.application) {
            return <ProgressBar indeterminate />;
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
            url,
            description,
            icon = 'apps',
            color,
        } = application;

        const content = this.state.activeTab === 0 ? (
            <Grid>
                <Cell col={3} tablet={4} phone={12}>
                    <h6> Toggles</h6>
                    <hr />
                    <List>
                    {seenToggles.map(({ name, description, enabled, notFound }, i) =>
                        (notFound ?
                        <ListItem twoLine key={i}>
                            <ListItemContent icon={'report'} subtitle={'Missing, want to create?'}>
                                <Link to={`/features/create?name=${name}`}>
                                    {name}
                                </Link>
                            </ListItemContent>
                        </ListItem> :
                        <ListItem twoLine key={i}>
                            <ListItemContent icon={<span><Switch disabled checked={!!enabled} /></span>} subtitle={description}>

                                <Link to={`/features/edit/${name}`}>
                                    {name}
                                </Link>
                            </ListItemContent>
                        </ListItem>)
                    )}
                    </List>
                </Cell>
                <Cell col={3} tablet={4} phone={12}>
                    <h6>Implemented strategies</h6>
                    <hr />
                    <List>
                        {strategies.map(({ name, description, notFound }, i) => (
                            notFound ?
                            <ListItem twoLine key={`${name}-${i}`}>
                                <ListItemContent icon={'report'} subtitle={'Missing, want to create?'}>
                                    <Link to={`/strategies/create?name=${name}`}>
                                        {name}
                                    </Link>
                                </ListItemContent>
                            </ListItem> :
                            <ListItem twoLine key={`${name}-${i}`}>
                                <ListItemContent icon={'toc'} subtitle={description}>
                                    <Link to={`/strategies/view/${name}`}>
                                        {name}
                                    </Link>
                                </ListItemContent>
                            </ListItem>
                        ))}
                    </List>
                </Cell>
                <Cell col={6} tablet={12}>
                    <h6>{instances.length} Instances connected</h6>
                    <hr />
                    <List>
                    {instances.map(({ instanceId, clientIp, lastSeen }, i) => (
                        <ListItem key={i} twoLine>
                            <ListItemContent
                                icon="timeline"
                                subtitle={
                                    <span>{clientIp} last seen at <small>{new Date(lastSeen).toLocaleString('nb-NO')}</small></span>
                                }>
                                {instanceId}
                            </ListItemContent>
                        </ListItem>
                    ))}
                    </List>
                </Cell>
            </Grid>) : (
            <Grid>
                <Cell col={12}>
                    <h5>Edit app meta data</h5>
                </Cell>
                <Cell col={6} tablet={12}>
                    <StatefulTextfield
                        value={url} label="URL" onBlur={(e) => storeApplicationMetaData(appName, 'url', e.target.value)} /><br />
                    <StatefulTextfield
                        value={description}
                        label="Description" rows={5} onBlur={(e) => storeApplicationMetaData(appName, 'description', e.target.value)} />
                </Cell>
                <Cell col={6} tablet={12}>
                    <StatefulTextfield
                        value={icon} label="Select icon" onBlur={(e) => storeApplicationMetaData(appName, 'icon', e.target.value)} />
                    <StatefulTextfield
                        value={color} label="Select color" onBlur={(e) => storeApplicationMetaData(appName, 'color', e.target.value)} />
                </Cell>
            </Grid>);


        return (
            <div>
                <HeaderTitle title={<span><Icon name={icon} /> {appName}</span>} subtitle={description}
                    actions={url && <ExternalIconLink url={url}>Visit site</ExternalIconLink>}
                />

                <Tabs activeTab={this.state.activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
                    <Tab>Metrics</Tab>
                    <Tab>Edit</Tab>
                </Tabs>

               {content}
            </div>
        );
    }
}


export default ClientApplications;
