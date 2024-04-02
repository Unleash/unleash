import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { styled } from '@mui/material';
import { StatusBox } from '../ProjectInsightsStats/StatusBox';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Link } from 'react-router-dom';
import type { ProjectInsightsSchemaMembers } from '../../../../../openapi';

interface IProjectMembersProps {
    members: ProjectInsightsSchemaMembers;
    projectId: string;
}

const NavigationBar = styled(Link)(({ theme }) => ({
    marginLeft: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    textDecoration: 'none',
    color: theme.palette.text.primary,
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
        <StatusBox
            title={'Project members'}
            boxText={`${currentMembers}`}
            change={change}
        >
            <NavigationBar to={link}>
                <KeyboardArrowRight />
            </NavigationBar>
        </StatusBox>
    );
};
