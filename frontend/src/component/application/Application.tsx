/* eslint react/no-multi-comp:off */
import type React from 'react';
import { useContext, useState } from 'react';
import {
    Box,
    IconButton,
    LinearProgress,
    Link,
    Tab,
    Tabs,
    Typography,
    styled,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { UPDATE_APPLICATION } from 'component/providers/AccessProvider/permissions';
import { ConnectedInstances } from './ConnectedInstances/ConnectedInstances.tsx';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import useApplicationsApi from 'hooks/api/actions/useApplicationsApi/useApplicationsApi';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useLocationSettings } from 'hooks/useLocationSettings';
import useToast from 'hooks/useToast';
import { formatDateYMD } from 'utils/formatDate';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import ApplicationOverview from './ApplicationOverview.tsx';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';

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

export const Application = () => {
    const navigate = useNavigate();
    const name = useRequiredPathParam('name');
    const { application, loading } = useApplication(name);
    const { appName, url, createdAt } = application;
    const { hasAccess } = useContext(AccessContext);
    const { deleteApplication } = useApplicationsApi();
    const { locationSettings } = useLocationSettings();
    const { setToastData, setToastApiError } = useToast();
    const { pathname } = useLocation();

    const basePath = `/applications/${encodeURIComponent(name)}`;

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
                text: 'Deleted Successfully',
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
            title: 'Last seen instances (24h)',
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

                                <PermissionIconButton
                                    tooltipProps={{
                                        title: 'Delete application',
                                    }}
                                    onClick={toggleModal}
                                    permission={UPDATE_APPLICATION}
                                >
                                    <Delete />
                                </PermissionIconButton>
                            </>
                        }
                    />

                    <Box sx={(theme) => ({ marginTop: theme.spacing(1) })}>
                        <Typography variant='body2'>
                            Created: {formatDate(createdAt)}
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
                    <Route path='instances' element={<ConnectedInstances />} />
                    <Route path='*' element={<ApplicationOverview />} />
                </Routes>
            </PageContent>
        </>
    );
};
