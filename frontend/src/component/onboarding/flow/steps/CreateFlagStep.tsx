import { Button } from '@mui/material';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import CheckIcon from '@mui/icons-material/Check';
import { FlagCreationButton } from '../../../project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/FlagCreationButton/FlagCreationButton.tsx';
import { StepLayout, type StepState } from './StepLayout.tsx';

interface ICreateFlagStepProps {
    state: StepState;
    refetchFeatures: () => void;
    refetchProject: () => void;
}

export const CreateFlagStep = ({
    state,
    refetchFeatures,
    refetchProject,
}: ICreateFlagStepProps) => {
    const isDone = state === 'done';

    return (
        <StepLayout
            stepNumber={1}
            state={state}
            icon={<OutlinedFlagIcon />}
            title='Create a feature flag'
            body='You must create a feature flag before you can connect a SDK.'
        >
            {isDone ? (
                <Button
                    variant='outlined'
                    color='inherit'
                    startIcon={<CheckIcon />}
                    disabled
                >
                    Done
                </Button>
            ) : (
                <FlagCreationButton
                    text='New feature flag'
                    skipNavigationOnComplete
                    onSuccess={() => {
                        refetchProject();
                        refetchFeatures();
                    }}
                />
            )}
        </StepLayout>
    );
};
