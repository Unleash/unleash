import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { IconButton, styled } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledVisibilityToggle = styled(IconButton, {
    shouldForwardProp: prop => prop !== 'visibilityOff',
})<{ visibilityOff: boolean }>(({ theme, visibilityOff }) => ({
    marginLeft: 'auto',
    marginRight: theme.spacing(-1),
    color: visibilityOff
        ? theme.palette.action.active
        : theme.palette.action.focus,
    '&:hover': {
        color: theme.palette.action.active,
    },
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
        <StyledVisibilityToggle
            onClick={toggleHiddenEnvironments}
            visibilityOff={hiddenEnvironments.has(environment.name)}
        >
            <ConditionallyRender
                condition={hiddenEnvironments.has(environment.name)}
                show={<VisibilityOff />}
                elseShow={<Visibility />}
            />
        </StyledVisibilityToggle>
    );
};
