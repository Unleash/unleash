import { EventLog } from 'component/events/EventLog/EventLog';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { styled } from '@mui/material';

const StyledDiv = styled('div')(({ theme }) => ({
    borderRadius: '12.5px',
    backgroundColor: theme.palette.background.paper,
    padding: '2rem',
}));

export const ProjectLog = () => {
    const projectId = useRequiredPathParam('projectId');

    return (
        <StyledDiv>
            <EventLog
                title="Event Log"
                project={projectId}
                displayInline
            ></EventLog>
        </StyledDiv>
    );
};
