import type { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { StyledProjectInfoSidebarContainer } from './ProjectInfo.styles';
import { HealthWidget } from './HealthWidget';
import { ToggleTypesWidget } from './ToggleTypesWidget';
import { MetaWidget } from './MetaWidget';
import { ProjectMembersWidget } from './ProjectMembersWidget';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ProjectStatsSchema } from '@server/openapi';
import { ChangeRequestsWidget } from './ChangeRequestsWidget';

interface IProjectInfoProps {
    id: string;
    memberCount: number;
    features: IFeatureToggleListItem[];
    health: number;
    description?: string;
    stats: ProjectStatsSchema;
}

const ProjectInfo = ({
    id,
    description,
    memberCount,
    health,
    features,
    stats,
}: IProjectInfoProps) => {
    const { uiConfig, isEnterprise } = useUiConfig();

    return (
        <aside>
            <StyledProjectInfoSidebarContainer>
                <ConditionallyRender
                    condition={
                        isEnterprise() &&
                        Boolean(uiConfig?.flags.newProjectOverview)
                    }
                    show={<ChangeRequestsWidget projectId={id} />}
                />
                <ConditionallyRender
                    condition={Boolean(uiConfig?.flags.newProjectOverview)}
                    show={<MetaWidget id={id} description={description} />}
                />
                <HealthWidget
                    projectId={id}
                    health={health}
                    total={features.length}
                    stale={features.filter(feature => feature.stale).length}
                />
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
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
