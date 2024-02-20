/* eslint react/no-multi-comp:off */
import React, { useContext, useState } from 'react';
import {
    Box,
    Avatar,
    Icon,
    IconButton,
    LinearProgress,
    Link,
    Tab,
    Tabs,
    Typography,
    styled,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { UPDATE_APPLICATION } from 'component/providers/AccessProvider/permissions';
import { ConnectedInstances } from '../ConnectedInstances/ConnectedInstances';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import useApplicationsApi from 'hooks/api/actions/useApplicationsApi/useApplicationsApi';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useLocationSettings } from 'hooks/useLocationSettings';
import useToast from 'hooks/useToast';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { formatDateYMD } from 'utils/formatDate';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useUiFlag } from 'hooks/useUiFlag';

type Tab = {
    title: string;
    path: string;
    name: string;
};

const StyledHeader = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(3),
}));

const TabContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
}));

const Separator = styled('div')(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.divider,
    height: '1px',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontSize: theme.fontSizes.bodySize,
    flexGrow: 1,
    flexBasis: 0,
    [theme.breakpoints.down('md')]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
        minWidth: 160,
    },
}));

export const ApplicationEdit = () => {
    const navigate = useNavigate();
    const name = useRequiredPathParam('name');
    const { application, loading } = useApplication(name);
    const { appName, url, description, icon = 'apps', createdAt } = application;
    const { hasAccess } = useContext(AccessContext);
    const { deleteApplication } = useApplicationsApi();
    const { locationSettings } = useLocationSettings();
    const { setToastData, setToastApiError } = useToast();
    const basePath = `/applications/${name}`;

    const { pathname } = useLocation();
    console.log('pathname is', pathname);

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
            title='Are you sure you want to delete this application?'
        />
    );

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

    const tabs: Tab[] = [
        {
            title: 'Overview',
            path: basePath,
            name: 'overview',
        },
        {
            title: 'Connected instances',
            path: `${basePath}/instances`,
            name: 'instances',
        },
    ];

    const newActiveTab = tabs.find((tab) => tab.path === pathname);

    return (
        <>
            <StyledHeader>
                <PageContent>
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
                                            size='large'
                                        >
                                            <LinkIcon titleAccess={url} />
                                        </IconButton>
                                    }
                                />

                                <PermissionButton
                                    tooltipProps={{
                                        title: 'Delete application',
                                    }}
                                    onClick={toggleModal}
                                    permission={UPDATE_APPLICATION}
                                >
                                    Delete
                                </PermissionButton>
                            </>
                        }
                    />

                    <Box sx={(theme) => ({ marginTop: theme.spacing(1) })}>
                        <Typography variant='body1'>
                            {description || ''}
                        </Typography>
                        <Typography variant='body2'>
                            Created: <strong>{formatDate(createdAt)}</strong>
                        </Typography>
                    </Box>
                </PageContent>
                <Separator />
                <TabContainer>
                    <Tabs
                        value={newActiveTab?.path}
                        indicatorColor='primary'
                        textColor='primary'
                        variant='scrollable'
                        allowScrollButtonsMobile
                    >
                        {tabs.map((tab) => {
                            return (
                                <StyledTab
                                    key={tab.title}
                                    label={tab.title}
                                    value={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    data-testid={`TAB_${tab.title}`}
                                />
                            );
                        })}
                    </Tabs>
                </TabContainer>
            </StyledHeader>
            <PageContent>
                <ConditionallyRender
                    condition={hasAccess(UPDATE_APPLICATION)}
                    show={<div>{renderModal()}</div>}
                />
                <Routes>
                    <Route path='/instances' element={<ConnectedInstances />} />
                    <Route path='*' element={<p>This is a placeholder</p>} />
                </Routes>
            </PageContent>
        </>
    );
};
