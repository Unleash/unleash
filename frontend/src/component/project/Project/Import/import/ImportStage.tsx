import React, { FC, useEffect } from 'react';
import { ImportLayoutContainer } from '../ImportLayoutContainer';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useImportApi } from 'hooks/api/actions/useImportApi/useImportApi';
import useToast from 'hooks/useToast';
import { Avatar, Button, styled, Typography } from '@mui/material';
import { ActionsContainer } from '../ActionsContainer';
import { Pending, Check, Error } from '@mui/icons-material';
import { PulsingAvatar } from '../PulsingAvatar';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Box } from '@mui/system';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import useProject from 'hooks/api/getters/useProject/useProject';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';

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
    border: `1px solid ${theme.palette.info.border}`,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    color: theme.palette.info.dark,
    backgroundColor: theme.palette.info.light,
    fontSize: theme.fontSizes.smallBody,
}));

type ApiStatus =
    | { status: 'success' }
    | { status: 'error'; errors: Record<string, string> }
    | { status: 'loading' };

const toApiStatus = (
    loading: boolean,
    errors: Record<string, string>
): ApiStatus => {
    if (loading) return { status: 'loading' };
    if (Object.keys(errors).length > 0) return { status: 'error', errors };
    return { status: 'success' };
};

export const ImportStage: FC<{
    environment: string;
    project: string;
    payload: string;
    onClose: () => void;
}> = ({ environment, project, payload, onClose }) => {
    const { createImport, loading, errors } = useImportApi();
    const { refetch: refreshProject } = useProject(project);
    const { refetch: refreshChangeRequests } =
        usePendingChangeRequests(project);
    const { setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(project);

    useEffect(() => {
        createImport({ environment, project, data: JSON.parse(payload) })
            .then(() => {
                refreshProject();
                refreshChangeRequests();
            })
            .catch(error => {
                setToastData({
                    type: 'error',
                    title: formatUnknownError(error),
                });
            });
    }, []);

    const importStatus = toApiStatus(loading, errors);

    const showChangeRequestInfo =
        isChangeRequestConfigured(environment) &&
        importStatus.status === 'success';

    return (
        <ImportLayoutContainer>
            <ImportStatusArea>
                <ConditionallyRender
                    condition={importStatus.status === 'loading'}
                    show={
                        <PulsingAvatar
                            sx={{ width: 80, height: 80 }}
                            active={true}
                        >
                            <Pending fontSize="large" />
                        </PulsingAvatar>
                    }
                />
                <ConditionallyRender
                    condition={importStatus.status === 'success'}
                    show={
                        <SuccessAvatar sx={{ width: 80, height: 80 }}>
                            <Check fontSize="large" />
                        </SuccessAvatar>
                    }
                />
                <ConditionallyRender
                    condition={importStatus.status === 'error'}
                    show={
                        <ErrorAvatar sx={{ width: 80, height: 80 }}>
                            <Error fontSize="large" />
                        </ErrorAvatar>
                    }
                />
                <ImportMessage>
                    <ConditionallyRender
                        condition={importStatus.status === 'loading'}
                        show={'Importing...'}
                    />
                    <ConditionallyRender
                        condition={importStatus.status === 'success'}
                        show={'Import completed'}
                    />
                    <ConditionallyRender
                        condition={importStatus.status === 'error'}
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
                    variant="contained"
                    type="submit"
                    onClick={onClose}
                >
                    Close
                </Button>
            </ActionsContainer>
        </ImportLayoutContainer>
    );
};
