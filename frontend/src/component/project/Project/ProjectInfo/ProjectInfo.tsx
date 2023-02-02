import { Box, styled, useMediaQuery, useTheme } from '@mui/material';
import type { ProjectStatsSchema } from '@server/openapi';
import type { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { HealthWidget } from './HealthWidget';
import { ToggleTypesWidget } from './ToggleTypesWidget';
import { MetaWidget } from './MetaWidget';
import { ProjectMembersWidget } from './ProjectMembersWidget';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ChangeRequestsWidget } from './ChangeRequestsWidget';
import { flexRow } from 'themes/themeStyles';

interface IProjectInfoProps {
    id: string;
    memberCount: number;
    features: IFeatureToggleListItem[];
    health: number;
    description?: string;
    stats: ProjectStatsSchema;
}

export const StyledProjectInfoSidebarContainer = styled(Box)(({ theme }) => ({
    ...flexRow,
    width: '225px',
    flexDirection: 'column',
    gap: theme.spacing(2),
    boxShadow: 'none',
    [theme.breakpoints.down('md')]: {
        display: 'grid',
        width: '100%',
        alignItems: 'stretch',
        marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
        display: 'flex',
    },
}));

const ProjectInfo = ({
    id,
    description,
    memberCount,
    health,
    features,
    stats,
}: IProjectInfoProps) => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const showChangeRequestsWidget = isEnterprise() && false;
    const showProjectMembersWidget = id !== DEFAULT_PROJECT_ID && false;
    const fitMoreColumns =
        (!showChangeRequestsWidget && !showProjectMembersWidget) ||
        (isSmallScreen && showChangeRequestsWidget && showProjectMembersWidget);

    return (
        <aside>
            <StyledProjectInfoSidebarContainer
                sx={
                    fitMoreColumns
                        ? {
                              gridTemplateColumns:
                                  'repeat(auto-fill, minmax(225px, 1fr))',
                          }
                        : { gridTemplateColumns: 'repeat(2, 1fr)' }
                }
            >
                <ConditionallyRender
                    condition={
                        showChangeRequestsWidget &&
                        Boolean(uiConfig?.flags.newProjectOverview)
                    }
                    show={
                        <Box
                            sx={{
                                gridColumnStart: showProjectMembersWidget
                                    ? 'span 2'
                                    : 'span 1',
                                flex: 1,
                                display: 'flex',
                            }}
                        >
                            <ChangeRequestsWidget projectId={id} />
                        </Box>
                    }
                />
                <ConditionallyRender
                    condition={Boolean(uiConfig?.flags.newProjectOverview)}
                    show={
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                            }}
                        >
                            <MetaWidget id={id} description={description} />
                        </Box>
                    }
                />
                <HealthWidget projectId={id} health={health} />
                <ConditionallyRender
                    condition={showProjectMembersWidget}
                    show={
                        <ProjectMembersWidget
                            projectId={id}
                            memberCount={memberCount}
                            change={stats?.projectMembersAddedCurrentWindow}
                        />
                    }
                />
                <ConditionallyRender
                    condition={Boolean(uiConfig?.flags.newProjectOverview)}
                    show={<ToggleTypesWidget features={features} />}
                />
            </StyledProjectInfoSidebarContainer>
        </aside>
    );
};

export default ProjectInfo;
