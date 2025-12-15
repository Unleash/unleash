import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Divider, styled } from '@mui/material';
import { ProjectActionsActionItem } from './ProjectActionsActionItem.tsx';
import type { ActionsActionState } from '../../useProjectActionsForm.ts';
import { ProjectActionsFormStep } from '../ProjectActionsFormStep.tsx';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Add from '@mui/icons-material/Add';
import type { IServiceAccount } from 'interfaces/service-account';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useActionConfigurations } from 'hooks/api/getters/useActionConfigurations/useActionConfigurations';

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(2, 0),
    marginBottom: theme.spacing(1),
    borderStyle: 'dashed',
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(1),
    gap: theme.spacing(1),
}));

interface IProjectActionsFormStepActionsProps {
    serviceAccounts: IServiceAccount[];
    serviceAccountsLoading: boolean;
    actions: ActionsActionState[];
    setActions: React.Dispatch<React.SetStateAction<ActionsActionState[]>>;
    actorId: number;
    setActorId: React.Dispatch<React.SetStateAction<number>>;
    validateActorId: (actorId: number) => boolean;
    validated: boolean;
}

export const ProjectActionsFormStepActions = ({
    serviceAccounts,
    serviceAccountsLoading,
    actions,
    setActions,
    actorId,
    setActorId,
    validateActorId,
    validated,
}: IProjectActionsFormStepActionsProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { actionConfigurations } = useActionConfigurations(projectId);

    const addAction = (projectId: string) => {
        const id = crypto.randomUUID();
        const action: ActionsActionState = {
            id,
            action: '',
            sortOrder:
                actions
                    .map((a) => a.sortOrder)
                    .reduce((a, b) => Math.max(a, b), 0) + 1,
            executionParams: {
                project: projectId,
            },
        };
        setActions([...actions, action]);
    };

    const updateInActions = (updatedAction: ActionsActionState) => {
        setActions((actions) =>
            actions.map((action) =>
                action.id === updatedAction.id ? updatedAction : action,
            ),
        );
    };

    const serviceAccountOptions = useMemo(() => {
        if (serviceAccountsLoading) {
            return [];
        }

        return serviceAccounts.map((sa) => ({
            label: sa.name,
            key: `${sa.id}`,
        }));
    }, [serviceAccountsLoading, serviceAccounts]);
    return (
        <ProjectActionsFormStep
            name='Do these actions'
            verticalConnector
            resourceLink={
                <RouterLink to='/admin/service-accounts'>
                    Create service account
                </RouterLink>
            }
        >
            <GeneralSelect
                label='Service account'
                name='service-account'
                options={serviceAccountOptions}
                value={`${actorId}`}
                onChange={(v) => {
                    validateActorId(Number(v));
                    setActorId(Number.parseInt(v, 10));
                }}
            />
            <StyledDivider />
            {actions.map((action, index) => (
                <ProjectActionsActionItem
                    index={index}
                    key={action.id}
                    action={action}
                    stateChanged={updateInActions}
                    actorId={actorId}
                    onDelete={() =>
                        setActions((actions) =>
                            actions.filter((a) => a.id !== action.id),
                        )
                    }
                    actionConfigurations={actionConfigurations}
                    validated={validated}
                />
            ))}
            <StyledButtonContainer>
                <Button
                    startIcon={<Add />}
                    onClick={() => addAction(projectId)}
                    variant='outlined'
                    color='primary'
                >
                    Add action
                </Button>
            </StyledButtonContainer>
        </ProjectActionsFormStep>
    );
};
