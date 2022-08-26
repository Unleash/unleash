/* eslint react/no-multi-comp:off */
import React, { useContext, useState } from 'react';
import {
    Avatar,
    Icon,
    IconButton,
    LinearProgress,
    Link,
    Typography,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { UPDATE_APPLICATION } from 'component/providers/AccessProvider/permissions';
import { ApplicationView } from '../ApplicationView/ApplicationView';
import { ApplicationUpdate } from '../ApplicationUpdate/ApplicationUpdate';
import { TabNav } from 'component/common/TabNav/TabNav/TabNav';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import useApplicationsApi from 'hooks/api/actions/useApplicationsApi/useApplicationsApi';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { useNavigate } from 'react-router-dom';
import { useLocationSettings } from 'hooks/useLocationSettings';
import useToast from 'hooks/useToast';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { formatDateYMD } from 'utils/formatDate';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const ApplicationEdit = () => {
    const navigate = useNavigate();
    const name = useRequiredPathParam('name');
    const { application, loading } = useApplication(name);
    const { appName, url, description, icon = 'apps', createdAt } = application;
    const { hasAccess } = useContext(AccessContext);
    const { deleteApplication } = useApplicationsApi();
    const { locationSettings } = useLocationSettings();
    const { setToastData, setToastApiError } = useToast();

    const [showDialog, setShowDialog] = useState(false);

    const toggleModal = () => {
        setShowDialog(!showDialog);
    };

    const formatDate = (v: string) => formatDateYMD(v, locationSettings.locale);

    const onDeleteApplication = async (evt: React.SyntheticEvent) => {
        evt.preventDefault();
        try {
            await deleteApplication(appName);
            setToastData({
                title: 'Deleted Successfully',
                text: 'Application deleted successfully',
                type: 'success',
            });
            navigate('/applications');
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
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
            header={
                <PageHeader
                    titleElement={
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
                    title={appName}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={Boolean(url)}
                                show={
                                    <IconButton
                                        component={Link}
                                        href={url}
                                        size="large"
                                    >
                                        <LinkIcon titleAccess={url} />
                                    </IconButton>
                                }
                            />

                            <PermissionButton
                                tooltipProps={{ title: 'Delete application' }}
                                onClick={toggleModal}
                                permission={UPDATE_APPLICATION}
                            >
                                Delete
                            </PermissionButton>
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
