import { Alert, styled } from '@mui/material';
import type { IActionSetEvent } from 'interfaces/action';
import { ProjectActionsEventsDetailsAction } from './ProjectActionsEventsDetailsAction.tsx';
import { ProjectActionsEventsDetailsSource } from './ProjectActionsEventsDetailsSource/ProjectActionsEventsDetailsSource.tsx';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

const StyledDetails = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
}));

const StyledAlert = styled(Alert)({
    fontSize: 'inherit',
});

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
            <StyledAlert
                severity={state === 'failed' ? 'error' : 'success'}
                icon={state === 'success' ? <CheckCircleOutline /> : undefined}
            >
                {stateText}
            </StyledAlert>
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
