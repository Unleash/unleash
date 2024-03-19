import { Button, Link, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import type { ISignalEndpoint } from 'interfaces/signal';
import { useSignalEndpointSignals } from 'hooks/api/getters/useSignalEndpointSignals/useSignalEndpointSignals';
import { Suspense, lazy } from 'react';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SidePanelList } from 'component/common/SidePanelList/SidePanelList';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const LazyReactJSONEditor = lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.fontSizes.mainHeader,
}));

const StyledHeaderRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});

const StyledHeaderSubtitle = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledTitle = styled('h1')({
    fontWeight: 'normal',
});

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(4),
}));

interface ISignalEndpointsSignalsModalProps {
    signalEndpoint?: ISignalEndpoint;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenConfiguration: () => void;
}

export const SignalEndpointsSignalsModal = ({
    signalEndpoint,
    open,
    setOpen,
    onOpenConfiguration,
}: ISignalEndpointsSignalsModalProps) => {
    const { uiConfig } = useUiConfig();
    const { locationSettings } = useLocationSettings();
    const { signalEndpointSignals, hasMore, loadMore, loading } =
        useSignalEndpointSignals(signalEndpoint?.id, 20, {
            refreshInterval: 5000,
        });

    if (!signalEndpoint) {
        return null;
    }

    const title = `Signals: ${signalEndpoint.name}`;

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={title}
        >
            <FormTemplate
                loading={loading && signalEndpointSignals.length === 0}
                modal
                description=''
                documentationLink=''
                documentationLinkLabel=''
                showGuidance={false}
            >
                <StyledHeader>
                    <StyledHeaderRow>
                        <StyledTitle>{title}</StyledTitle>
                        <Link onClick={onOpenConfiguration}>
                            View configuration
                        </Link>
                    </StyledHeaderRow>
                    <StyledHeaderSubtitle>
                        <p>
                            {uiConfig.unleashUrl}/api/signal-endpoint/
                            {signalEndpoint.name}
                        </p>
                        <StyledDescription>
                            {signalEndpoint.description}
                        </StyledDescription>
                    </StyledHeaderSubtitle>
                </StyledHeader>
                <StyledForm>
                    <SidePanelList
                        height={960}
                        items={signalEndpointSignals}
                        columns={[
                            {
                                header: 'Date',
                                maxWidth: 220,
                                cell: ({ createdAt }) =>
                                    formatDateYMDHMS(
                                        createdAt,
                                        locationSettings?.locale,
                                    ),
                            },
                            {
                                header: 'Token',
                                maxWidth: 300,
                                cell: ({ tokenName }) => tokenName,
                            },
                        ]}
                        sidePanelHeader='Payload'
                        renderContent={(event) => (
                            <Suspense fallback={null}>
                                <LazyReactJSONEditor
                                    content={{ json: event.payload }}
                                    readOnly
                                    statusBar={false}
                                    editorStyle='sidePanel'
                                />
                            </Suspense>
                        )}
                        listEnd={
                            <ConditionallyRender
                                condition={hasMore}
                                show={
                                    <Button onClick={loadMore}>
                                        Load more
                                    </Button>
                                }
                            />
                        }
                    />
                    <ConditionallyRender
                        condition={signalEndpointSignals.length === 0}
                        show={
                            <p>
                                No signals have been received on this signal
                                endpoint.
                            </p>
                        }
                    />
                    <StyledButtonContainer>
                        <Button
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
