/* eslint react/no-multi-comp:off */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Avatar, Link, Icon, IconButton, Button, LinearProgress, Typography } from '@material-ui/core';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';
import { formatFullDateTimeWithLocale, formatDateWithLocale } from '../common/util';
import { UPDATE_APPLICATION } from '../AccessProvider/permissions';
import ApplicationView from './application-view';
import ApplicationUpdate from './application-update';
import TabNav from '../common/TabNav/TabNav';
import Dialogue from '../common/Dialogue';
import PageContent from '../common/PageContent';
import HeaderTitle from '../common/HeaderTitle';
import AccessContext from '../../contexts/AccessContext';

class ClientApplications extends PureComponent {
    static contextType = AccessContext;

    static propTypes = {
        fetchApplication: PropTypes.func.isRequired,
        appName: PropTypes.string,
        application: PropTypes.object,
        location: PropTypes.object,
        storeApplicationMetaData: PropTypes.func.isRequired,
        deleteApplication: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
    };

    constructor(props) {
        super();
        this.state = {
            activeTab: 0,
            loading: !props.application,
            prompt: false,
        };
    }

    componentDidMount() {
        this.props.fetchApplication(this.props.appName).finally(() => this.setState({ loading: false }));
    }
    formatFullDateTime = v => formatFullDateTimeWithLocale(v, this.props.location.locale);
    formatDate = v => formatDateWithLocale(v, this.props.location.locale);

    deleteApplication = async evt => {
        evt.preventDefault();
        // if (window.confirm('Are you sure you want to remove this application?')) {
        const { deleteApplication, appName } = this.props;
        await deleteApplication(appName);
        this.props.history.push('/applications');
        // }
    };

    render() {
        if (this.state.loading) {
            return (
                <div>
                    <p>Loading...</p>
                    <LinearProgress />
                </div>
            );
        } else if (!this.props.application) {
            return <p>Application ({this.props.appName}) not found</p>;
        }
        const { hasAccess } = this.context;
        const { application, storeApplicationMetaData } = this.props;
        const { appName, instances, strategies, seenToggles, url, description, icon = 'apps', createdAt } = application;

        const toggleModal = () => {
            this.setState(prev => ({ ...prev, prompt: !prev.prompt }));
        };

        const renderModal = () => (
            <Dialogue
                open={this.state.prompt}
                onClose={toggleModal}
                onClick={this.deleteApplication}
                title="Are you sure you want to delete this application?"
            />
        );

        const tabData = [
            {
                label: 'Application overview',
                component: (
                    <ApplicationView
                        strategies={strategies}
                        instances={instances}
                        seenToggles={seenToggles}
                        hasAccess={hasAccess}
                        formatFullDateTime={this.formatFullDateTime}
                    />
                ),
            },
            {
                label: 'Edit application',
                component: (
                    <ApplicationUpdate application={application} storeApplicationMetaData={storeApplicationMetaData} />
                ),
            },
        ];

        return (
            <PageContent
                headerContent={
                    <HeaderTitle
                        title={
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar style={{ marginRight: '8px' }}>
                                    <Icon>{icon || 'apps'}</Icon>
                                </Avatar>
                                {appName}
                            </span>
                        }
                        actions={
                            <>
                                <ConditionallyRender
                                    condition={url}
                                    show={
                                        <IconButton component={Link} href={url}>
                                            <Icon>link</Icon>
                                        </IconButton>
                                    }
                                />

                                <ConditionallyRender
                                    condition={hasAccess(UPDATE_APPLICATION)}
                                    show={
                                        <Button color="secondary" title="Delete application" onClick={toggleModal}>
                                            Delete
                                        </Button>
                                    }
                                />
                            </>
                        }
                    />
                }
            >
                <div>
                    <Typography variant="body1">{description || ''}</Typography>
                    <Typography variant="body2">
                        Created: <strong>{this.formatDate(createdAt)}</strong>
                    </Typography>
                </div>
                <ConditionallyRender
                    condition={hasAccess(UPDATE_APPLICATION)}
                    show={
                        <div>
                            {renderModal()}

                            <TabNav tabData={tabData} />
                        </div>
                    }
                />
            </PageContent>
        );
    }
}

export default ClientApplications;
