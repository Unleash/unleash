import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { StyledDivContainer } from './ProjectInfo.styles';
import { IFeatureToggleListItem } from '../../../../interfaces/featureToggle';
import { HealthWidget } from './HealthWidget';
import { ToggleTypesWidget } from './ToggleTypesWidget';
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
    memberCount,
    health,
    features,
}: IProjectInfoProps) => {
    const { uiConfig } = useUiConfig();
    return (
        <aside>
            <StyledDivContainer>
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
                <ConditionallyRender
                    condition={Boolean(uiConfig?.flags.newProjectOverview)}
                    show={<ToggleTypesWidget features={features} />}
                />
            </StyledDivContainer>
        </aside>
    );
};

export default ProjectInfo;
