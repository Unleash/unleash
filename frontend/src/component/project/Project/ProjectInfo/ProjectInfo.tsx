import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { DEFAULT_PROJECT_ID } from '../../../../hooks/api/getters/useDefaultProject/useDefaultProjectId';
import {
    StyledDivContainer,
    StyledDivInfoContainer,
    StyledDivPercentageContainer,
    StyledParagraphSubtitle,
    StyledParagraphEmphasizedText,
    StyledLink,
    StyledSpanLinkText,
    StyledArrowIcon,
} from './ProjectInfo.styles';

interface IProjectInfoProps {
    id: string;
    memberCount: number;
    featureCount: number;
    health: number;
    description?: string;
}

const ProjectInfo = ({ id, memberCount, health }: IProjectInfoProps) => {
    const { uiConfig } = useUiConfig();

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${id}/settings/access`;
    }

    return (
        <aside>
            <StyledDivContainer>
                <StyledDivInfoContainer>
                    <StyledDivPercentageContainer>
                        <PercentageCircle percentage={health} />
                    </StyledDivPercentageContainer>
                    <StyledParagraphSubtitle data-loading>
                        Overall health rating
                    </StyledParagraphSubtitle>
                    <StyledParagraphEmphasizedText data-loading>
                        {health}%
                    </StyledParagraphEmphasizedText>
                    <StyledLink data-loading to={`/projects/${id}/health`}>
                        <StyledSpanLinkText data-loading>
                            view more{' '}
                        </StyledSpanLinkText>
                        <StyledArrowIcon data-loading />
                    </StyledLink>
                </StyledDivInfoContainer>
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
            </StyledDivContainer>
        </aside>
    );
};

export default ProjectInfo;
