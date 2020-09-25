/* eslint react/no-multi-comp:off */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Button, Card, CardActions, CardTitle, CardText, CardMenu, Icon, ProgressBar, Tabs, Tab } from 'react-mdl';
import { IconLink, styles as commonStyles } from '../common';
import { formatFullDateTimeWithLocale } from '../common/util';
import { UPDATE_APPLICATION } from '../../permissions';
import ApplicationView from './application-view';
import ApplicationUpdate from './application-update';

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
        super();
        this.state = { activeTab: 0, loading: !props.application };
    }

    componentDidMount() {
        this.props.fetchApplication(this.props.appName).finally(() => this.setState({ loading: false }));
    }
    formatFullDateTime = v => formatFullDateTimeWithLocale(v, this.props.location.locale);

    deleteApplication = async evt => {
        evt.preventDefault();
        const { deleteApplication, appName } = this.props;
        await deleteApplication(appName);
        this.props.history.push('/applications');
    };

    render() {
        if (this.state.loading) {
            return (
                <div>
                    <p>Loading...</p>
                    <ProgressBar indeterminate />
                </div>
            );
        } else if (!this.props.application) {
            return <p>Application ({this.props.appName}) not found</p>;
        }
        const { application, storeApplicationMetaData, hasPermission } = this.props;
        const { appName, instances, strategies, seenToggles, url, description, icon = 'apps' } = application;

        const content =
            this.state.activeTab === 0 ? (
                <ApplicationView
                    strategies={strategies}
                    instances={instances}
                    seenToggles={seenToggles}
                    hasPermission={hasPermission}
                    formatFullDateTime={this.formatFullDateTime}
                />
            ) : (
                <ApplicationUpdate application={application} storeApplicationMetaData={storeApplicationMetaData} />
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
