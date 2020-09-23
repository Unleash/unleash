/* eslint react/no-multi-comp:off */
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import {
    Button,
    Grid,
    Cell,
    Card,
    CardActions,
    CardTitle,
    CardText,
    CardMenu,
    List,
    ListItem,
    ListItemContent,
    Textfield,
    Icon,
    ProgressBar,
    Tabs,
    Tab,
    Switch,
} from 'react-mdl';
import { IconLink, shorten, styles as commonStyles } from '../common';
import { formatFullDateTimeWithLocale } from '../common/util';
import { CREATE_FEATURE, CREATE_STRATEGY, UPDATE_APPLICATION } from '../../permissions';
import icons from './icon-names';
import MySelect from '../common/select';

class StatefulTextfield extends Component {
    static propTypes = {
        value: PropTypes.string,
        label: PropTypes.string,
        rows: PropTypes.number,
        onBlur: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { value: props.value };
        this.setValue = function setValue(e) {
            this.setState({ value: e.target.value });
        }.bind(this);
    }

    render() {
        return (
            <Textfield
                style={{ width: '100%' }}
                label={this.props.label}
                floatingLabel
                rows={this.props.rows}
                value={this.state.value}
                onChange={this.setValue}
                onBlur={this.props.onBlur}
            />
        );
    }
}

class ClientApplications extends PureComponent {
    static propTypes = {
        fetchApplication: PropTypes.func.isRequired,
        appName: PropTypes.string,
        application: PropTypes.object,
        location: PropTypes.object,
        storeApplicationMetaData: PropTypes.func.isRequired,
        deleteApplication: PropTypes.func.isRequired,
        hasPermission: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { activeTab: 0 };
    }

    componentDidMount() {
        this.props.fetchApplication(this.props.appName);
    }
    formatFullDateTime(v) {
        return formatFullDateTimeWithLocale(v, this.props.location.locale);
    }

    deleteApplication = async evt => {
        evt.preventDefault();
        const { deleteApplication, appName } = this.props;
        await deleteApplication(appName);
        this.props.history.push('/applications');
    };

    render() {
        if (!this.props.application) {
            return <ProgressBar indeterminate />;
        }
        const { application, storeApplicationMetaData, hasPermission } = this.props;
        const { appName, instances, strategies, seenToggles, url, description, icon = 'apps', color } = application;

        const content =
            this.state.activeTab === 0 ? (
                <Grid style={{ margin: 0 }}>
                    <Cell col={6} tablet={4} phone={12}>
                        <h6> Toggles</h6>
                        <hr />
                        <List>
                            {seenToggles.map(({ name, description, enabled, notFound }, i) =>
                                notFound ? (
                                    <ListItem twoLine key={i}>
                                        {hasPermission(CREATE_FEATURE) ? (
                                            <ListItemContent icon={'report'} subtitle={'Missing, want to create?'}>
                                                <Link to={`/features/create?name=${name}`}>{name}</Link>
                                            </ListItemContent>
                                        ) : (
                                            <ListItemContent icon={'report'} subtitle={'Missing'}>
                                                {name}
                                            </ListItemContent>
                                        )}
                                    </ListItem>
                                ) : (
                                    <ListItem twoLine key={i}>
                                        <ListItemContent
                                            icon={
                                                <span>
                                                    <Switch disabled checked={!!enabled} />
                                                </span>
                                            }
                                            subtitle={shorten(description, 60)}
                                        >
                                            <Link to={`/features/view/${name}`}>{shorten(name, 50)}</Link>
                                        </ListItemContent>
                                    </ListItem>
                                )
                            )}
                        </List>
                    </Cell>
                    <Cell col={6} tablet={4} phone={12}>
                        <h6>Implemented strategies</h6>
                        <hr />
                        <List>
                            {strategies.map(({ name, description, notFound }, i) =>
                                notFound ? (
                                    <ListItem twoLine key={`${name}-${i}`}>
                                        {hasPermission(CREATE_STRATEGY) ? (
                                            <ListItemContent icon={'report'} subtitle={'Missing, want to create?'}>
                                                <Link to={`/strategies/create?name=${name}`}>{name}</Link>
                                            </ListItemContent>
                                        ) : (
                                            <ListItemContent icon={'report'} subtitle={'Missing'}>
                                                {name}
                                            </ListItemContent>
                                        )}
                                    </ListItem>
                                ) : (
                                    <ListItem twoLine key={`${name}-${i}`}>
                                        <ListItemContent icon={'extension'} subtitle={shorten(description, 60)}>
                                            <Link to={`/strategies/view/${name}`}>{shorten(name, 50)}</Link>
                                        </ListItemContent>
                                    </ListItem>
                                )
                            )}
                        </List>
                    </Cell>
                    <Cell col={12} tablet={12}>
                        <h6>{instances.length} Instances registered</h6>
                        <hr />
                        <List>
                            {instances.map(({ instanceId, clientIp, lastSeen, sdkVersion }, i) => (
                                <ListItem key={i} twoLine>
                                    <ListItemContent
                                        icon="timeline"
                                        subtitle={
                                            <span>
                                                {clientIp} last seen at{' '}
                                                <small>{this.formatFullDateTime(lastSeen)}</small>
                                            </span>
                                        }
                                    >
                                        {instanceId} {sdkVersion ? `(${sdkVersion})` : ''}
                                    </ListItemContent>
                                </ListItem>
                            ))}
                        </List>
                    </Cell>
                </Grid>
            ) : (
                <Grid>
                    <Cell col={6} tablet={12}>
                        <StatefulTextfield
                            value={url}
                            label="URL"
                            type="url"
                            onBlur={e => storeApplicationMetaData(appName, 'url', e.target.value)}
                        />
                        <br />
                        <StatefulTextfield
                            value={description}
                            label="Description"
                            rows={5}
                            onBlur={e => storeApplicationMetaData(appName, 'description', e.target.value)}
                        />
                    </Cell>
                    <Cell col={6} tablet={12}>
                        <MySelect
                            label="Icon"
                            options={icons.map(v => ({ key: v, label: v }))}
                            value={icon}
                            onChange={e => storeApplicationMetaData(appName, 'icon', e.target.value)}
                            filled
                        />
                        <StatefulTextfield
                            value={color}
                            label="Color"
                            onBlur={e => storeApplicationMetaData(appName, 'color', e.target.value)}
                        />
                    </Cell>
                </Grid>
            );

        return (
            <Card shadow={0} className={commonStyles.fullwidth}>
                <CardTitle style={{ paddingTop: '24px', paddingRight: '64px', wordBreak: 'break-all' }}>
                    <Icon name={icon || 'apps'} />
                    &nbsp;{appName}
                </CardTitle>
                {description && <CardText>{description}</CardText>}
                {url && (
                    <CardMenu>
                        <IconLink url={url} icon="link" />
                    </CardMenu>
                )}
                {hasPermission(UPDATE_APPLICATION) ? (
                    <div>
                        <CardActions
                            border
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span />
                            <Button accent title="Delete application" onClick={this.deleteApplication}>
                                Delete
                            </Button>
                        </CardActions>
                        <hr />
                        <Tabs
                            activeTab={this.state.activeTab}
                            onChange={tabId => this.setState({ activeTab: tabId })}
                            ripple
                            tabBarProps={{ style: { width: '100%' } }}
                            className="mdl-color--grey-100"
                        >
                            <Tab>Details</Tab>
                            <Tab>Edit</Tab>
                        </Tabs>
                    </div>
                ) : (
                    ''
                )}

                {content}
            </Card>
        );
    }
}

export default ClientApplications;
