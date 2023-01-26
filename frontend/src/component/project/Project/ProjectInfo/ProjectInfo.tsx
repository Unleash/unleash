import type { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { StyledProjectInfoSidebarContainer } from './ProjectInfo.styles';
import { HealthWidget } from './HealthWidget';
import { ToggleTypesWidget } from './ToggleTypesWidget';
import { MetaWidget } from './MetaWidget';
import { ProjectMembersWidget } from './ProjectMembersWidget';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IProjectInfoProps {
    id: string;
    memberCount: number;
    features: IFeatureToggleListItem[];
    health: number;
    description?: string;
}

const ProjectInfo = ({
    id,
    description,
    memberCount,
    health,
    features,
}: IProjectInfoProps) => {
    const { uiConfig } = useUiConfig();
    return (
        <aside>
            <StyledProjectInfoSidebarContainer>
                <ConditionallyRender
                    condition={Boolean(uiConfig?.flags.newProjectOverview)}
                    show={<MetaWidget id={id} description={description} />}
                />
                <HealthWidget projectId={id} health={health} />
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={
                        <ProjectMembersWidget
                            projectId={id}
                            memberCount={memberCount}
                        />
                    }
                />
                <ToggleTypesWidget features={features} />
            </StyledProjectInfoSidebarContainer>
        </aside>
    );
};

export default ProjectInfo;
