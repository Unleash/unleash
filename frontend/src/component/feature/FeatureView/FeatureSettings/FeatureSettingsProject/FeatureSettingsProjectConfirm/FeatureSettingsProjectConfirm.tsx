import { useMemo } from 'react';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { arraysHaveSameItems } from 'utils/arraysHaveSameItems';
import { Alert, List, ListItem, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledList = styled(List)({
    padding: 0,
});

interface IFeatureSettingsProjectConfirm {
    projectId: string;
    open: boolean;
    onClose: () => void;
    onClick: (args: any) => void;
    feature: IFeatureToggle;
    changeRequests: ChangeRequestType[] | undefined;
}

const FeatureSettingsProjectConfirm = ({
    projectId,
    open,
    onClose,
    onClick,
    feature,
    changeRequests,
}: IFeatureSettingsProjectConfirm) => {
    const currentProjectId = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(projectId);

    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(projectId);
    const targetProjectHasChangeRequestsEnabled =
        isChangeRequestConfiguredInAnyEnv();
    const hasSameEnvironments: boolean = useMemo(() => {
        return arraysHaveSameItems(
            feature.environments.map((env) => env.name),
            project.environments?.map((projectEnv) => projectEnv.environment) ||
                [],
        );
    }, [feature, project]);

    const hasPendingChangeRequests = changeRequests
        ? changeRequests.length > 0
        : false;

    const hasDependencies =
        feature.dependencies.length > 0 || feature.children.length > 0;

    return (
        <ConditionallyRender
            condition={
                hasSameEnvironments &&
                !hasDependencies &&
                !hasPendingChangeRequests &&
                !targetProjectHasChangeRequestsEnabled
            }
            show={
                <Dialogue
                    open={open}
                    onClose={onClose}
                    onClick={onClick}
                    title='Confirm change project'
                    primaryButtonText='Change project'
                    secondaryButtonText='Cancel'
                >
                    <StyledContainer>
                        <StyledAlert severity='success'>
                            This feature flag is compatible with the new
                            project.
                        </StyledAlert>
                        <p>
                            Are you sure you want to change the project for this
                            flag?
                        </p>
                    </StyledContainer>
                </Dialogue>
            }
            elseShow={
                <Dialogue
                    open={open}
                    onClick={onClose}
                    title='Confirm change project'
                    primaryButtonText='Close'
                >
                    <StyledContainer>
                        <StyledAlert severity='warning'>
                            Cannot proceed with the move
                        </StyledAlert>

                        <ConditionallyRender
                            condition={hasDependencies}
                            show={
                                <p>
                                    <span>
                                        The feature flag must not have any
                                        dependencies.
                                    </span>{' '}
                                    <br />
                                    <span>
                                        Please remove feature dependencies
                                        first.
                                    </span>
                                </p>
                            }
                        />
                        <ConditionallyRender
                            condition={!hasSameEnvironments}
                            show={
                                <p>
                                    In order to move a feature flag between two
                                    projects, both projects must have the exact
                                    same environments enabled.
                                </p>
                            }
                        />
                        <ConditionallyRender
                            condition={hasPendingChangeRequests}
                            show={
                                <>
                                    <p>
                                        The feature flag must not have any
                                        pending change requests. This feature
                                        flag is currently referenced in the
                                        following change requests:
                                    </p>
                                    <StyledList>
                                        {changeRequests?.map(
                                            (changeRequest) => {
                                                return (
                                                    <ListItem
                                                        key={changeRequest.id}
                                                    >
                                                        <Link
                                                            to={`/projects/${currentProjectId}/change-requests/${changeRequest.id}`}
                                                        >
                                                            View change request{' '}
                                                            {changeRequest.id}
                                                        </Link>
                                                    </ListItem>
                                                );
                                            },
                                        )}
                                    </StyledList>
                                </>
                            }
                        />
                        <ConditionallyRender
                            condition={targetProjectHasChangeRequestsEnabled}
                            show={
                                <p>
                                    You're not allowed to move the feature to
                                    project{' '}
                                    <Link
                                        to={`/projects/${projectId}/settings/change-requests`}
                                    >
                                        {projectId}
                                    </Link>
                                    . This project has change requests enabled.
                                </p>
                            }
                        />
                    </StyledContainer>
                </Dialogue>
            }
        />
    );
};

export default FeatureSettingsProjectConfirm;
