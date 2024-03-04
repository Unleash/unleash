import { Alert, styled } from '@mui/material';
import { IActionSetEvent } from 'interfaces/action';
import { ProjectActionsEventsDetailsAction } from './ProjectActionsEventsDetailsAction';
import { ProjectActionsEventsDetailsSource } from './ProjectActionsEventsDetailsSource/ProjectActionsEventsDetailsSource';

const StyledDetails = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
}));

export const ProjectActionsEventsDetails = ({
    state,
    actionSet: { actions },
    signal,
}: IActionSetEvent) => {
    const stateText =
        state === 'failed'
            ? `${
                  actions.filter(({ state }) => state !== 'success').length
              } out of ${actions.length} actions were not successfully executed`
            : 'All actions were successfully executed';

    return (
        <StyledDetails>
            <Alert severity={state === 'failed' ? 'error' : 'success'}>
                {stateText}
            </Alert>
            <ProjectActionsEventsDetailsSource signal={signal} />
            {actions.map((action, i) => (
                <ProjectActionsEventsDetailsAction
                    key={action.id}
                    action={action}
                >
                    Action {i + 1}
                </ProjectActionsEventsDetailsAction>
            ))}
        </StyledDetails>
    );
};
