import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { styled } from '@mui/material';
import { RemoveRedEye } from '@mui/icons-material';
import { useGlobalLocalStorage } from 'hooks/useGlobalLocalStorage';

const HideButton = styled(RemoveRedEye)(({ theme }) => ({
    cursor: 'pointer',
    marginLeft: 'auto',
    color: theme.palette.grey[700],
}));

interface IFeatureOverviewSidePanelEnvironmentHiderProps {
    environment: IFeatureEnvironment;
}

export const FeatureOverviewSidePanelEnvironmentHider = ({
    environment,
}: IFeatureOverviewSidePanelEnvironmentHiderProps) => {
    const { value: globalStore, setValue: setGlobalStore } =
        useGlobalLocalStorage();

    const toggleHiddenEnvironments = () => {
        setGlobalStore(params => {
            const hiddenEnvironments = new Set(params.hiddenEnvironments);
            if (hiddenEnvironments.has(environment.name)) {
                hiddenEnvironments.delete(environment.name);
            } else {
                hiddenEnvironments.add(environment.name);
            }
            return {
                ...globalStore,
                hiddenEnvironments: hiddenEnvironments,
            };
        });
    };

    return <HideButton onClick={toggleHiddenEnvironments} />;
};
