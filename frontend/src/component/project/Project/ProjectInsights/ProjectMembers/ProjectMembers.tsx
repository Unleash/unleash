import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Box, styled, Typography } from '@mui/material';
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

export const ProjectMembers = ({
    members,
    projectId,
}: IProjectMembersProps) => {
    const { uiConfig } = useUiConfig();

    const link = uiConfig?.versionInfo?.current?.enterprise
        ? `/projects/${projectId}/settings/access`
        : `/admin/users`;

    const { currentMembers, change } = members;
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
        </StyledProjectInfoWidgetContainer>
    );
};
