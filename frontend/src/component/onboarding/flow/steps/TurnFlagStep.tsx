import { Button } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import CheckIcon from '@mui/icons-material/Check';
import { Link } from 'react-router-dom';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { StepLayout, type StepState } from './StepLayout.tsx';

interface ITurnFlagStepProps {
    projectId: string;
    state: StepState;
}

export const TurnFlagStep = ({ projectId, state }: ITurnFlagStepProps) => {
    const { features } = useFeatureSearch({
        project: `IS:${projectId}`,
    });
    const firstFeature = features[0]?.name;
    const goToFlagHref = firstFeature
        ? `/projects/${projectId}/features/${firstFeature}`
        : `/projects/${projectId}`;

    return (
        <StepLayout
            stepNumber={3}
            state={state}
            icon={<ToggleOnIcon />}
            title='Turn flag on/off'
            body='Check that the flag is working by turning it on and off.'
        >
            {state === 'done' ? (
                <Button
                    variant='outlined'
                    color='inherit'
                    startIcon={<CheckIcon />}
                    disabled
                >
                    Done
                </Button>
            ) : state === 'active' ? (
                <Button
                    variant='contained'
                    color='primary'
                    component={Link}
                    to={goToFlagHref}
                >
                    Go to flag
                </Button>
            ) : (
                <Button variant='contained' color='primary' disabled>
                    Go to flag
                </Button>
            )}
        </StepLayout>
    );
};
