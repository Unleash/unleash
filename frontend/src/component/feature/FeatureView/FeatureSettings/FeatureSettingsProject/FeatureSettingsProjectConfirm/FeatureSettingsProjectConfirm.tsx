import { useMemo } from 'react';
import useProject from 'hooks/api/getters/useProject/useProject';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { arraysHaveSameItems } from 'utils/arraysHaveSameItems';
import { Alert, List, ListItem, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

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
    changeRequests: IChangeRequest[] | undefined;
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
    const { project } = useProject(projectId);

    const hasSameEnvironments: boolean = useMemo(() => {
        return arraysHaveSameItems(
            feature.environments.map(env => env.name),
            project.environments
        );
    }, [feature, project]);

    const hasPendingChangeRequests = changeRequests
        ? changeRequests.length > 0
        : false;

    return (
        <ConditionallyRender
            condition={hasSameEnvironments && !hasPendingChangeRequests}
            show={
                <Dialogue
                    open={open}
                    onClose={onClose}
                    onClick={onClick}
                    title="Confirm change project"
                    primaryButtonText="Change project"
                    secondaryButtonText="Cancel"
                >
                    <StyledContainer>
                        <StyledAlert severity="success">
                            This feature toggle is compatible with the new
                            project.
                        </StyledAlert>
                        <p>
                            Are you sure you want to change the project for this
                            toggle?
                        </p>
                    </StyledContainer>
                </Dialogue>
            }
            elseShow={
                <Dialogue
                    open={open}
                    onClick={onClose}
                    title="Confirm change project"
                    primaryButtonText="OK"
                >
                    <StyledContainer>
                        <StyledAlert severity="warning">
                            Incompatible project environments
                        </StyledAlert>
                        <p>
                            In order to move a feature toggle between two
                            projects, both projects must have the exact same
                            environments enabled.
                        </p>
                        <ConditionallyRender
                            condition={hasPendingChangeRequests}
                            show={
                                <>
                                    <p>
                                        In addition the feature toggle must not
                                        have any pending change requests. This
                                        feature toggle is currently referenced
                                        in the following change requests:
                                    </p>
                                    <StyledList>
                                        {changeRequests?.map(changeRequest => {
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
                                        })}
                                    </StyledList>
                                </>
                            }
                        />
                    </StyledContainer>
                </Dialogue>
            }
        />
    );
};

export default FeatureSettingsProjectConfirm;
