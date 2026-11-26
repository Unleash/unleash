import { type FC, useEffect } from 'react';
import { ImportLayoutContainer } from '../ImportLayoutContainer.tsx';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useImportApi } from 'hooks/api/actions/useImportApi/useImportApi';
import useToast from 'hooks/useToast';
import { Avatar, Button, styled, Typography } from '@mui/material';
import { ActionsContainer } from '../ActionsContainer.tsx';
import Check from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Pending from '@mui/icons-material/Pending';
import { PulsingAvatar } from 'component/common/PulsingAvatar/PulsingAvatar';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Box } from '@mui/system';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useProjectFeatureSearch } from '../../PaginatedProjectFeatureToggles/useProjectFeatureSearch.ts';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';
import type { RemoteData } from 'hooks/api/RemoteData';

export const ImportStatusArea = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 2, 2, 2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(8),
}));

const ImportMessage = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
}));

export const SuccessAvatar = styled(Avatar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
}));

export const ErrorAvatar = styled(Avatar)(({ theme }) => ({
    backgroundColor: theme.palette.error.main,
}));

const InfoContainer = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.info.containerBorder}`,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    color: theme.palette.info.onContainer,
    backgroundColor: theme.palette.info.container,
    fontSize: theme.fontSizes.smallBody,
}));

const toApiStatus = (
    loading: boolean,
    errors: Record<string, string>,
): RemoteData<undefined, Record<string, string>> => {
    if (loading) return { state: 'loading' };
    if (Object.keys(errors).length > 0)
        return { state: 'error', error: errors };
    return { state: 'success', data: undefined };
};

export const ImportStage: FC<{
    environment: string;
    project: string;
    payload: string;
    onClose: () => void;
    tracking: Tracking;
}> = ({ environment, project, payload, onClose, tracking }) => {
    const { createImport, loading, errors } = useImportApi();
    const { refetch: refreshProject } = useProjectFeatureSearch(project);
    const { refetch: refreshChangeRequests } =
        usePendingChangeRequests(project);
    const { setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(project);
    const trackImportFlags = useTracking(tracking);

    useEffect(() => {
        const data = JSON.parse(payload);
        trackImportFlags
            .mutation(() => createImport({ environment, project, data }), {
                flagCount: data.features?.length ?? 0,
            })
            .then(() => {
                refreshProject();
                refreshChangeRequests();
            })
            .catch((error) => {
                setToastData({
                    type: 'error',
                    text: formatUnknownError(error),
                });
            });
    }, []);

    const importStatus = toApiStatus(loading, errors);

    const showChangeRequestInfo =
        isChangeRequestConfigured(environment) &&
        importStatus.state === 'success';

    return (
        <ImportLayoutContainer>
            <ImportStatusArea>
                <ConditionallyRender
                    condition={importStatus.state === 'loading'}
                    show={
                        <PulsingAvatar
                            sx={{ width: 80, height: 80 }}
                            active={true}
                        >
                            <Pending fontSize='large' />
                        </PulsingAvatar>
                    }
                />
                <ConditionallyRender
                    condition={importStatus.state === 'success'}
                    show={
                        <SuccessAvatar sx={{ width: 80, height: 80 }}>
                            <Check fontSize='large' />
                        </SuccessAvatar>
                    }
                />
                <ConditionallyRender
                    condition={importStatus.state === 'error'}
                    show={
                        <ErrorAvatar sx={{ width: 80, height: 80 }}>
                            <ErrorIcon fontSize='large' />
                        </ErrorAvatar>
                    }
                />
                <ImportMessage>
                    <ConditionallyRender
                        condition={importStatus.state === 'loading'}
                        show={'Importing...'}
                    />
                    <ConditionallyRender
                        condition={importStatus.state === 'success'}
                        show={'Import completed'}
                    />
                    <ConditionallyRender
                        condition={importStatus.state === 'error'}
                        show={'Import failed'}
                    />
                </ImportMessage>
            </ImportStatusArea>
            <ConditionallyRender
                condition={showChangeRequestInfo}
                show={
                    <InfoContainer>
                        For this environment <strong>Change request</strong> is
                        enabled. This means that the import has generated a
                        change request which needs to be approved before the
                        configuration will be visible in the instance.
                    </InfoContainer>
                }
            />

            <ActionsContainer>
                <Button
                    sx={{ position: 'static' }}
                    variant='contained'
                    type='submit'
                    onClick={onClose}
                >
                    Close
                </Button>
            </ActionsContainer>
        </ImportLayoutContainer>
    );
};
