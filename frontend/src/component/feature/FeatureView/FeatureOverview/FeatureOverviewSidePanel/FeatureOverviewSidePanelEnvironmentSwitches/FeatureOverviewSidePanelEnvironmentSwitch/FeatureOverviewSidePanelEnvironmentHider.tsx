import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { styled } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const Visible = styled(Visibility)(({ theme }) => ({
    cursor: 'pointer',
    marginLeft: 'auto',
    marginTop: theme.spacing(0.5),
    color: theme.palette.neutral.main,
    '&:hover': {
        opacity: 1,
    },
    opacity: 0,
}));

const VisibleOff = styled(VisibilityOff)(({ theme }) => ({
    cursor: 'pointer',
    marginLeft: 'auto',
    color: theme.palette.neutral.main,
}));

interface IFeatureOverviewSidePanelEnvironmentHiderProps {
    environment: IFeatureEnvironment;
    hiddenEnvironments: Set<String>;
    setHiddenEnvironments: (environment: string) => void;
}

export const FeatureOverviewSidePanelEnvironmentHider = ({
    environment,
    hiddenEnvironments,
    setHiddenEnvironments,
}: IFeatureOverviewSidePanelEnvironmentHiderProps) => {
    const toggleHiddenEnvironments = () => {
        setHiddenEnvironments(environment.name);
    };

    return (
        <ConditionallyRender
            condition={hiddenEnvironments.has(environment.name)}
            show={<VisibleOff onClick={toggleHiddenEnvironments} />}
            elseShow={<Visible onClick={toggleHiddenEnvironments} />}
        />
    );
};
