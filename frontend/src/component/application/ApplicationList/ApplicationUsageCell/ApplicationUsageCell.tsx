import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import type { ApplicationUsageSchema } from 'openapi';

export interface IApplicationUsageCellProps {
    usage: ApplicationUsageSchema[] | undefined;
}
export interface IApplicationUsage {
    project: string;
    environments: string[];
}

const StyledLink = styled(Link)(() => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const formatProject = (projectInfo: IApplicationUsage, index: number) => {
    const separator = index !== 0 ? ', ' : '';
    const key = projectInfo.project;
    const projectElement =
        projectInfo.project !== '*' ? (
            <StyledLink key={key} to={`/projects/${projectInfo.project}`}>
                {projectInfo.project}
            </StyledLink>
        ) : (
            <span key={key}>{projectInfo.project}</span>
        );

    const environments = ` (${projectInfo.environments.join(', ')})`;

    return [separator, projectElement, environments];
};

export const ApplicationUsageCell = ({ usage }: IApplicationUsageCellProps) => {
    const theme = useTheme();
    const formattedProjects = usage?.flatMap((p, index) =>
        formatProject(p, index),
    );
    return (
        <TextCell>
            <ConditionallyRender
                condition={usage !== undefined && usage.length > 0}
                show={
                    <Typography variant='body2'>{formattedProjects}</Typography>
                }
                elseShow={
                    <Typography
                        variant='body2'
                        color={theme.palette.text.secondary}
                    >
                        not connected
                    </Typography>
                }
            />
        </TextCell>
    );
};
