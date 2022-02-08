/* eslint react/no-multi-comp:off */
import { useContext, useEffect, useState } from 'react';
import {
    Avatar,
    Link,
    Icon,
    IconButton,
    Button,
    LinearProgress,
    Typography,
} from '@material-ui/core';
import { Link as LinkIcon } from '@material-ui/icons';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';
import {
    formatDateWithLocale,
} from '../common/util';
import { UPDATE_APPLICATION } from '../providers/AccessProvider/permissions';
import ApplicationView from './ApplicationView';
import ApplicationUpdate from './ApplicationUpdate';
import TabNav from '../common/TabNav/TabNav';
import Dialogue from '../common/Dialogue';
import PageContent from '../common/PageContent';
import HeaderTitle from '../common/HeaderTitle';
import AccessContext from '../../contexts/AccessContext';
import useApplicationsApi from '../../hooks/api/actions/useApplicationsApi/useApplicationsApi';
import useApplication from '../../hooks/api/getters/useApplication/useApplication';
import { useHistory, useParams } from 'react-router-dom';
import { useLocationSettings } from '../../hooks/useLocationSettings';

const EditApplication = () => {
    const history = useHistory();
    const { name } = useParams<{ name: string }>();
    const { refetchApplication, application } = useApplication(name);
    const { appName, url, description, icon = 'apps', createdAt } = application;
    const { hasAccess } = useContext(AccessContext);
    const { deleteApplication } = useApplicationsApi();
    const { locationSettings } = useLocationSettings();

    console.log(locationSettings)

    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        refetchApplication();
        setLoading(false);
        // eslint-disable-next-line
    }, []);

    const toggleModal = () => {
        setShowDialog(!showDialog);
    };

    const formatDate = (v: Date) =>
        formatDateWithLocale(v, locationSettings.locale);

    const onDeleteApplication = async (evt: Event) => {
        evt.preventDefault();
        await deleteApplication(appName);
        history.push('/applications');
    };

    const renderModal = () => (
        <Dialogue
            open={showDialog}
            onClose={toggleModal}
            onClick={onDeleteApplication}
            title="Are you sure you want to delete this application?"
        />
    );
    const tabData = [
        {
            label: 'Application overview',
            component: <ApplicationView />,
        },
        {
            label: 'Edit application',
            component: <ApplicationUpdate application={application} />,
        },
    ];

    if (loading) {
        return (
            <div>
                <p>Loading...</p>
                <LinearProgress />
            </div>
        );
    } else if (!application) {
        return <p>Application ({appName}) not found</p>;
    }
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
                                        <LinkIcon />
                                    </IconButton>
                                }
                            />

                            <ConditionallyRender
                                condition={hasAccess(UPDATE_APPLICATION)}
                                show={
                                    <Button
                                        color="secondary"
                                        title="Delete application"
                                        onClick={toggleModal}
                                    >
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
                    Created: <strong>{formatDate(createdAt)}</strong>
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
};

export default EditApplication;
