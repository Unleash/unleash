import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { EventLog } from 'component/events/EventLog/EventLog';
import { styled } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4),
}));

const FeatureLog = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);

    if (!feature.name) {
        return null;
    }

    return (
        <StyledContainer>
            <EventLog title="Event log" feature={featureId} displayInline />
        </StyledContainer>
    );
};

export default FeatureLog;
