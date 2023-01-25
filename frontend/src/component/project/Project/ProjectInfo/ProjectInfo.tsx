import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { DEFAULT_PROJECT_ID } from '../../../../hooks/api/getters/useDefaultProject/useDefaultProjectId';
import {
    StyledArrowIcon,
    StyledDivContainer,
    StyledDivInfoContainer,
    StyledLink,
    StyledParagraphEmphasizedText,
    StyledParagraphSubtitle,
    StyledSpanLinkText,
} from './ProjectInfo.styles';
import { IFeatureToggleListItem } from '../../../../interfaces/featureToggle';
import { HealthWidget } from './HealthWidget';
import { ToggleTypesWidget } from './ToggleTypesWidget';

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

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${id}/settings/access`;
    }

    return (
        <aside>
            <StyledDivContainer>
                <HealthWidget projectId={id} health={health} />
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={
                        <StyledDivInfoContainer style={{ marginBottom: '0' }}>
                            <StyledParagraphSubtitle data-loading>
                                Project members
                            </StyledParagraphSubtitle>
                            <StyledParagraphEmphasizedText data-loading>
                                {memberCount}
                            </StyledParagraphEmphasizedText>
                            <StyledLink data-loading to={link}>
                                <StyledSpanLinkText data-loading>
                                    view more{' '}
                                </StyledSpanLinkText>
                                <StyledArrowIcon data-loading />
                            </StyledLink>
                        </StyledDivInfoContainer>
                    }
                />
                <ToggleTypesWidget features={features} />
            </StyledDivContainer>
        </aside>
    );
};

export default ProjectInfo;
