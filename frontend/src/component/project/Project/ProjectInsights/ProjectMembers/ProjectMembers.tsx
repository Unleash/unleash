import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Box, styled, Typography, useTheme } from '@mui/material';
import { StatusBox } from '../ProjectInsightsStats/StatusBox';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Link } from 'react-router-dom';

interface IProjectMembersWidgetProps {
    projectId: string;
    memberCount: number;
    change?: number;
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

export const ActiveBar = styled('div')(({ theme }) => ({
    width: '59%',
    height: '100%',
    backgroundColor: theme.palette.success.border,
    borderRadius: theme.shape.borderRadius,
}));

export const InactiveBar = styled('div')(({ theme }) => ({
    width: '39%',
    height: '20px',
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
})<{ color?: string }>(({ theme, color }) => ({
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
    projectId,
    memberCount,
    change = 0,
}: IProjectMembersWidgetProps) => {
    const { uiConfig } = useUiConfig();
    const theme = useTheme();
    let link = `/admin/users`;

    if (uiConfig?.versionInfo?.current?.enterprise) {
        link = `/projects/${projectId}/settings/access`;
    }

    return (
        <StyledProjectInfoWidgetContainer>
            <NavigationBar to={link}>
                <Typography variant='h3'>Project members</Typography>
                <KeyboardArrowRight />
            </NavigationBar>
            <Box
                data-loading
                sx={{
                    display: 'flex',
                }}
            >
                <StatusBox boxText={`${memberCount}`} change={change} />
            </Box>
            <BarContainer>
                <ActiveBar />
                <InactiveBar />
            </BarContainer>
            <CountContainer>
                <CountRow to={link}>
                    <div>
                        <StatusWithDot>
                            <Dot color={theme.palette.success.border} />
                            <Box>Active</Box>
                            <StyledCount>{memberCount - 1}</StyledCount>
                        </StatusWithDot>
                    </div>
                    <KeyboardArrowRight />
                </CountRow>
                <CountRow to={link}>
                    <div>
                        <StatusWithDot>
                            <Dot color={theme.palette.warning.border} />
                            <Box>Inactive</Box>
                            <StyledCount>1</StyledCount>
                        </StatusWithDot>
                    </div>
                    <KeyboardArrowRight />
                </CountRow>
            </CountContainer>
        </StyledProjectInfoWidgetContainer>
    );
};
