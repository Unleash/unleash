import { useEffect, useState, type VFC } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { Alert, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useHighestPermissionChangeRequestEnvironment } from 'hooks/useHighestPermissionChangeRequestEnvironment';
import { useScheduledChangeRequestsWithFlags } from 'hooks/api/getters/useScheduledChangeRequestsWithFlags/useScheduledChangeRequestsWithFlags';
import type { ScheduledChangeRequestViewModel } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';

interface IFeatureArchiveDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    projectId: string;
    featureIds: string[];
    featuresWithUsage?: string[];
}

const RemovedDependenciesAlert = () => {
    return (
        <Alert severity='warning' sx={{ m: (theme) => theme.spacing(2, 0) }}>
            Archiving flags with dependencies will also remove those
            dependencies.
        </Alert>
    );
};

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
                    {`${ids.length} feature flags `}
                </Typography>
                <span>
                    have usage from applications. If you archive these feature
                    flags they will not be available to Client SDKs:
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

const ArchiveParentError = ({
    ids,
    projectId,
}: {
    ids?: string[];
    projectId: string;
}) => {
    const formatPath = (id: string) => {
        return `/projects/${projectId}/features/${id}`;
    };

    if (ids && ids.length > 1) {
        return (
            <Alert
                severity={'error'}
                sx={{ m: (theme) => theme.spacing(2, 0) }}
            >
                <Typography
                    fontWeight={'bold'}
                    variant={'body2'}
                    display='inline'
                >
                    {`${ids.length} feature flags `}
                </Typography>
                <span>
                    have child features that depend on them and are not part of
                    the archive operation. These parent features can not be
                    archived:
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
    if (ids && ids.length === 1) {
        return (
            <Alert
                severity={'error'}
                sx={{ m: (theme) => theme.spacing(2, 0) }}
            >
                <Link to={formatPath(ids[0])}>{ids[0]}</Link> has child features
                that depend on it and are not part of the archive operation.
            </Alert>
        );
    }
    return null;
};

const ScheduledChangeRequestAlert: VFC<{
    changeRequests?: ScheduledChangeRequestViewModel[];
    projectId: string;
}> = ({ changeRequests, projectId }) => {
    if (changeRequests && changeRequests.length > 0) {
        return (
            <Alert
                severity='warning'
                sx={{ m: (theme) => theme.spacing(2, 0) }}
            >
                <p>
                    This archive operation would conflict with{' '}
                    {changeRequests.length} scheduled change request(s). The
                    change request(s) that would be affected by this are:
                </p>
                <ul>
                    {changeRequests.map(({ id, title }) => {
                        const text = title
                            ? `#${id} (${title})`
                            : `Change request #${id}`;
                        return (
                            <li key={id}>
                                <Link
                                    to={`/projects/${projectId}/change-requests/${id}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    title={`Change request ${id}`}
                                >
                                    {text}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Alert>
        );
    } else if (changeRequests === undefined) {
        return (
            <Alert severity='warning'>
                <p>
                    This archive operation might conflict with one or more
                    scheduled change requests. If you complete it, those change
                    requests can no longer be applied.
                </p>
            </Alert>
        );
    }

    // all good, we have nothing to show
    return null;
};

const useActionButtonText = (projectId: string, isBulkArchive: boolean) => {
    const getHighestEnvironment =
        useHighestPermissionChangeRequestEnvironment(projectId);
    const environment = getHighestEnvironment();
    const { isChangeRequestConfiguredForReview } =
        useChangeRequestsEnabled(projectId);
    if (
        environment &&
        isChangeRequestConfiguredForReview(environment) &&
        isBulkArchive
    ) {
        return 'Add to change request';
    }
    if (environment && isChangeRequestConfiguredForReview(environment)) {
        return 'Add change to draft';
    }
    if (isBulkArchive) {
        return 'Archive flags';
    }
    return 'Archive flag';
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
    const { isChangeRequestConfiguredForReview } =
        useChangeRequestsEnabled(projectId);
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
            type: 'success',
            text: isBulkArchive
                ? 'Changes added to a draft'
                : 'Change added to a draft',
        });
    };

    const archiveToggle = async () => {
        await archiveFeatureToggle(projectId, featureIds[0]);
        setToastData({
            type: 'success',
            text: 'Feature flag archived',
        });
    };

    const archiveToggles = async () => {
        await archiveFeatures(projectId, featureIds);
        setToastData({
            type: 'success',
            text: 'Feature flags archived',
        });
    };

    return async () => {
        try {
            if (
                environment &&
                isChangeRequestConfiguredForReview(environment)
            ) {
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

const useVerifyArchive = (
    featureIds: string[],
    projectId: string,
    isOpen: boolean,
) => {
    const [disableArchive, setDisableArchive] = useState(true);
    const [offendingParents, setOffendingParents] = useState<string[]>([]);
    const [hasDeletedDependencies, setHasDeletedDependencies] = useState(false);
    const { verifyArchiveFeatures } = useProjectApi();

    useEffect(() => {
        if (isOpen) {
            verifyArchiveFeatures(projectId, featureIds)
                .then((res) => res.json())
                .then(
                    ({ hasDeletedDependencies, parentsWithChildFeatures }) => {
                        if (parentsWithChildFeatures.length === 0) {
                            setDisableArchive(false);
                            setOffendingParents(parentsWithChildFeatures);
                        } else {
                            setDisableArchive(true);
                            setOffendingParents(parentsWithChildFeatures);
                        }
                        setHasDeletedDependencies(hasDeletedDependencies);
                    },
                );
        }
    }, [
        JSON.stringify(featureIds),
        isOpen,
        projectId,
        setOffendingParents,
        setDisableArchive,
        setHasDeletedDependencies,
    ]);

    return { disableArchive, offendingParents, hasDeletedDependencies };
};

export const FeatureArchiveDialog: VFC<IFeatureArchiveDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    projectId,
    featureIds,
    featuresWithUsage,
}) => {
    const isBulkArchive = featureIds?.length > 1;

    const buttonText = useActionButtonText(projectId, isBulkArchive);

    const dialogTitle = isBulkArchive
        ? 'Archive feature flags'
        : 'Archive feature flag';

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

    const { changeRequests } = useScheduledChangeRequestsWithFlags(
        projectId,
        featureIds,
    );

    const { disableArchive, offendingParents, hasDeletedDependencies } =
        useVerifyArchive(featureIds, projectId, isOpen);

    const removeDependenciesWarning =
        offendingParents.length === 0 && hasDeletedDependencies;

    return (
        <Dialogue
            onClick={archiveAction}
            open={isOpen}
            onClose={onClose}
            primaryButtonText={buttonText}
            secondaryButtonText='Cancel'
            title={dialogTitle}
            disabledPrimaryButton={disableArchive}
        >
            <ConditionallyRender
                condition={isBulkArchive}
                show={
                    <>
                        <p>
                            Are you sure you want to archive{' '}
                            <strong>{featureIds?.length}</strong> feature flags?
                        </p>

                        <ConditionallyRender
                            condition={Boolean(
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
                            condition={offendingParents.length > 0}
                            show={
                                <ArchiveParentError
                                    ids={offendingParents}
                                    projectId={projectId}
                                />
                            }
                        />
                        <ConditionallyRender
                            condition={removeDependenciesWarning}
                            show={<RemovedDependenciesAlert />}
                        />

                        <ScheduledChangeRequestAlert
                            changeRequests={changeRequests}
                            projectId={projectId}
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
                    <>
                        <p>
                            Are you sure you want to archive{' '}
                            {isBulkArchive
                                ? 'these feature flags'
                                : 'this feature flag'}
                            ?
                        </p>
                        <ConditionallyRender
                            condition={offendingParents.length > 0}
                            show={
                                <ArchiveParentError
                                    ids={offendingParents}
                                    projectId={projectId}
                                />
                            }
                        />
                        <ConditionallyRender
                            condition={removeDependenciesWarning}
                            show={<RemovedDependenciesAlert />}
                        />

                        <ScheduledChangeRequestAlert
                            changeRequests={changeRequests}
                            projectId={projectId}
                        />
                    </>
                }
            />
        </Dialogue>
    );
};
