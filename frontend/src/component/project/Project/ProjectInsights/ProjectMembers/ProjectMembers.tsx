import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Box, styled, Typography, useTheme } from '@mui/material';
import { StatusBox } from '../ProjectInsightsStats/StatusBox';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Link } from 'react-router-dom';
import type { ProjectInsightsSchemaMembers } from '../../../../../openapi';

interface IProjectMembersProps {
    members: ProjectInsightsSchemaMembers;
    projectId: string;
}

const NavigationBar = styled(Link)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    textDecoration: 'none',
    color: theme.palette.text.primary,
}));

export const StyledProjectInfoWidgetContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}));

export const BarContainer = styled('div')(({ theme }) => ({
    width: '100%',
    height: '20px',
    display: 'flex',
}));

const ActiveBar = styled('span', {
    shouldForwardProp: (prop) => prop !== 'percentage',
})<{
    percentage: number;
}>(({ theme, percentage }) => ({
    width: `${percentage - 1}%`,
    backgroundColor: theme.palette.success.border,
    borderRadius: theme.shape.borderRadius,
}));

const InactiveBar = styled('span', {
    shouldForwardProp: (prop) => prop !== 'percentage',
})<{
    percentage: number;
}>(({ theme, percentage }) => ({
    width: `${percentage - 1}%`,
    backgroundColor: theme.palette.warning.border,
    marginLeft: 'auto',
    borderRadius: theme.shape.borderRadius,
}));

export const CountContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

export const CountRow = styled(NavigationBar)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(0.5, 1, 0, 2),
    alignItems: 'center',
    gap: theme.spacing(3),
    alignSelf: 'stretch',
    borderRadius: theme.shape.borderRadiusMedium,
    background: '#F7F7FA',
}));

const StatusWithDot = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const Dot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{
    color?: string;
}>(({ theme, color }) => ({
    height: '15px',
    width: '15px',
    borderRadius: '50%',
    display: 'inline-block',
    backgroundColor: color,
}));

export const StyledCount = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.primary,
}));

export const ProjectMembers = ({
    members,
    projectId,
}: IProjectMembersProps) => {
    const { uiConfig } = useUiConfig();
    const theme = useTheme();
    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${projectId}/settings/access`;
    }

    const { active, totalPreviousMonth, inactive } = members;

    const currentMembers = active + inactive;
    const change = currentMembers - (totalPreviousMonth || 0);

    const activePercentage = (active / currentMembers) * 100;
    const inactivePercentage = (inactive / currentMembers) * 100;

    return (
        <StyledProjectInfoWidgetContainer>
            <NavigationBar to={link}>
                <Typography variant='h3'>Project members</Typography>
                <KeyboardArrowRight />
            </NavigationBar>
            <Box
                sx={{
                    display: 'flex',
                }}
            >
                <StatusBox boxText={`${currentMembers}`} change={change} />
            </Box>
            <BarContainer>
                <ActiveBar percentage={activePercentage} />
                <InactiveBar percentage={inactivePercentage} />
            </BarContainer>
            <CountContainer>
                <CountRow to={link}>
                    <StatusWithDot>
                        <Dot color={theme.palette.success.border} />
                        <Box>Active</Box>
                        <StyledCount>{active}</StyledCount>
                    </StatusWithDot>
                    <KeyboardArrowRight />
                </CountRow>
                <CountRow to={link}>
                    <StatusWithDot>
                        <Dot color={theme.palette.warning.border} />
                        <Box>Inactive</Box>
                        <StyledCount>{inactive}</StyledCount>
                    </StatusWithDot>
                    <KeyboardArrowRight />
                </CountRow>
            </CountContainer>
        </StyledProjectInfoWidgetContainer>
    );
};
