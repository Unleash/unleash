import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import {
    StyledArrowIcon,
    StyledProjectInfoSidebarContainer,
    StyledProjectInfoWidgetContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledWidgetTitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import { HealthWidget } from './HealthWidget';
import { ToggleTypesWidget } from './ToggleTypesWidget';
import { MetaWidget } from './MetaWidget';

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

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${id}/settings/access`;
    }

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
                        <StyledProjectInfoWidgetContainer style={{ marginBottom: '0' }}>
                            <StyledWidgetTitle data-loading>
                                Project members
                            </StyledWidgetTitle>
                            <StyledParagraphEmphasizedText data-loading>
                                {memberCount}
                            </StyledParagraphEmphasizedText>
                            <StyledLink data-loading to={link}>
                                <StyledSpanLinkText data-loading>
                                    view more{' '}
                                </StyledSpanLinkText>
                                <StyledArrowIcon data-loading />
                            </StyledLink>
                        </StyledProjectInfoWidgetContainer>
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
