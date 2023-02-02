import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { flexRow } from 'themes/themeStyles';
import { styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledDivInfoContainer = styled('div')(({ theme }) => ({
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    width: '100%',
    padding: theme.spacing(3, 2, 3, 2),
    [theme.breakpoints.down('md')]: {
        ...flexRow,
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: theme.fontSizes.smallBody,
        position: 'relative',
        padding: theme.spacing(1.5),
    },
}));

const StyledParagraphSubtitle = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledParagraphEmphasizedText = styled('p')(({ theme }) => ({
    fontSize: '1.5rem',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        fontSize: theme.fontSizes.bodySize,
        marginBottom: theme.spacing(4),
    },
}));

const StyledSpanLinkText = styled('p')(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    ...flexRow,
    justifyContent: 'center',
    color: theme.palette.primary.main,
    [theme.breakpoints.down('md')]: {
        position: 'absolute',
        right: theme.spacing(1.5),
        bottom: theme.spacing(1.5),
    },
}));

const StyledArrowIcon = styled(ArrowForwardIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
}));

interface ILegacyProjectMembersWidgetProps {
    projectId: string;
    memberCount: number;
}

/**
 * @deprecated
 */
export const LegacyProjectMembersWidget = ({
    projectId,
    memberCount,
}: ILegacyProjectMembersWidgetProps) => {
    const { uiConfig } = useUiConfig();

    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${projectId}/settings/access`;
    }

    return (
        <StyledDivInfoContainer>
            <StyledParagraphSubtitle data-loading>
                Project members
            </StyledParagraphSubtitle>
            <StyledParagraphEmphasizedText data-loading>
                {memberCount}
            </StyledParagraphEmphasizedText>
            <StyledLink data-loading to={link}>
                <StyledSpanLinkText data-loading>view more </StyledSpanLinkText>
                <StyledArrowIcon data-loading />
            </StyledLink>
        </StyledDivInfoContainer>
    );
};
