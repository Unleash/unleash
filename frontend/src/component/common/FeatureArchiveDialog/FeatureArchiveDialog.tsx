import { VFC } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { Alert, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useHighestPermissionChangeRequestEnvironment } from 'hooks/useHighestPermissionChangeRequestEnvironment';

interface IFeatureArchiveDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    projectId: string;
    featureIds: string[];
    featuresWithUsage?: string[];
}

const UsageWarning = ({
    ids,
    projectId,
}: {
    ids?: string[];
    projectId: string;
}) => {
    const formatPath = (id: string) => {
        return `/projects/${projectId}/features/${id}`;
    };
    if (ids) {
        return (
            <Alert
                severity={'warning'}
                sx={{ m: (theme) => theme.spacing(2, 0) }}
            >
                <Typography
                    fontWeight={'bold'}
                    variant={'body2'}
                    display='inline'
                >
                    {`${ids.length} feature toggles `}
                </Typography>
                <span>
                    have usage from applications. If you archive these feature
                    toggles they will not be available to Client SDKs:
                </span>
                <ul>
                    {ids?.map((id) => (
                        <li key={id}>
                            {<Link to={formatPath(id)}>{id}</Link>}
                        </li>
                    ))}
                </ul>
            </Alert>
        );
    }
    return null;
};

const useActionButtonText = (projectId: string, isBulkArchive: boolean) => {
    const getHighestEnvironment =
        useHighestPermissionChangeRequestEnvironment(projectId);
    const environment = getHighestEnvironment();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    if (
        environment &&
        isChangeRequestConfigured(environment) &&
        isBulkArchive
    ) {
        return 'Add to change request';
    }
    if (environment && isChangeRequestConfigured(environment)) {
        return 'Add change to draft';
    }
    if (isBulkArchive) {
        return 'Archive toggles';
    }
    return 'Archive toggle';
};

const useArchiveAction = ({
    projectId,
    featureIds,
    onSuccess,
    onError,
}: {
    projectId: string;
    featureIds: string[];
    onSuccess: () => void;
    onError: () => void;
}) => {
    const { setToastData, setToastApiError } = useToast();
    const { archiveFeatureToggle } = useFeatureApi();
    const { archiveFeatures } = useProjectApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const getHighestEnvironment =
        useHighestPermissionChangeRequestEnvironment(projectId);
    const isBulkArchive = featureIds?.length > 1;
    const environment = getHighestEnvironment();
    const addArchiveToggleToChangeRequest = async () => {
        if (!environment) {
            console.error('No change request environment');
            return;
        }
        await addChange(
            projectId,
            environment,
            featureIds.map((feature) => ({
                action: 'archiveFeature',
                feature: feature,
                payload: undefined,
            })),
        );
        refetchChangeRequests();
        setToastData({
            text: isBulkArchive
                ? 'Your archive feature toggles changes have been added to change request'
                : 'Your archive feature toggle change has been added to change request',
            type: 'success',
            title: isBulkArchive
                ? 'Changes added to a draft'
                : 'Change added to a draft',
        });
    };

    const archiveToggle = async () => {
        await archiveFeatureToggle(projectId, featureIds[0]);
        setToastData({
            text: 'Your feature toggle has been archived',
            type: 'success',
            title: 'Feature archived',
        });
    };

    const archiveToggles = async () => {
        await archiveFeatures(projectId, featureIds);
        setToastData({
            text: 'Selected feature toggles have been archived',
            type: 'success',
            title: 'Features archived',
        });
    };

    return async () => {
        try {
            if (environment && isChangeRequestConfigured(environment)) {
                await addArchiveToggleToChangeRequest();
            } else if (isBulkArchive) {
                await archiveToggles();
            } else {
                await archiveToggle();
            }

            onSuccess();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            onError();
        }
    };
};

export const FeatureArchiveDialog: VFC<IFeatureArchiveDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    projectId,
    featureIds,
    featuresWithUsage,
}) => {
    const { uiConfig } = useUiConfig();

    const isBulkArchive = featureIds?.length > 1;

    const buttonText = useActionButtonText(projectId, isBulkArchive);

    const dialogTitle = isBulkArchive
        ? 'Archive feature toggles'
        : 'Archive feature toggle';

    const archiveAction = useArchiveAction({
        projectId,
        featureIds,
        onSuccess() {
            onConfirm();
            onClose();
        },
        onError() {
            onClose();
        },
    });

    return (
        <Dialogue
            onClick={archiveAction}
            open={isOpen}
            onClose={onClose}
            primaryButtonText={buttonText}
            secondaryButtonText='Cancel'
            title={dialogTitle}
        >
            <ConditionallyRender
                condition={isBulkArchive}
                show={
                    <>
                        <p>
                            Are you sure you want to archive{' '}
                            <strong>{featureIds?.length}</strong> feature
                            toggles?
                        </p>
                        <ConditionallyRender
                            condition={Boolean(
                                uiConfig.flags.lastSeenByEnvironment &&
                                    featuresWithUsage &&
                                    featuresWithUsage?.length > 0,
                            )}
                            show={
                                <UsageWarning
                                    ids={featuresWithUsage}
                                    projectId={projectId}
                                />
                            }
                        />
                        <ConditionallyRender
                            condition={featureIds?.length <= 5}
                            show={
                                <ul>
                                    {featureIds?.map((id) => (
                                        <li key={id}>{id}</li>
                                    ))}
                                </ul>
                            }
                        />
                    </>
                }
                elseShow={
                    <p>
                        Are you sure you want to archive{' '}
                        {isBulkArchive
                            ? 'these feature toggles'
                            : 'this feature toggle'}
                        ?
                    </p>
                }
            />
        </Dialogue>
    );
};
