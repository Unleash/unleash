import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ProjectModeBadge } from 'component/project/ProjectCard/ProjectModeBadge/ProjectModeBadge';
import type { ProjectSchema } from 'openapi';
import { Link } from 'react-router-dom';

const StyledCellContainer = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
}));

const StyledFeatureLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

type ProjectsListTableNameCellProps = {
    row: {
        original: ProjectSchema;
    };
};

export const ProjectsListTableNameCell = ({
    row,
}: ProjectsListTableNameCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <StyledCellContainer>
            <ProjectModeBadge mode={row.original.mode} />
            <StyledFeatureLink to={`/projects/${row.original.id}`}>
                <Truncator title={row.original.name} lines={2} arrow>
                    <Highlighter search={searchQuery}>
                        {row.original.name}
                    </Highlighter>
                </Truncator>
            </StyledFeatureLink>
        </StyledCellContainer>
    );
};
