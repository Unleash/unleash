import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Fragment, VFC } from 'react';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)(() => ({
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

interface IProjectsListProps {
    project?: string;
    projects?: string | string[];
}

export const ProjectsList: VFC<IProjectsListProps> = ({
    projects,
    project,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    let fields: string[] =
        projects && Array.isArray(projects)
            ? projects
            : project
            ? [project]
            : [];

    if (fields.length === 0) {
        return (
            <TextCell>
                <Highlighter search={searchQuery}>*</Highlighter>
            </TextCell>
        );
    }

    return (
        <TextCell>
            {fields.map((item, index) => (
                <Fragment key={item}>
                    {index > 0 && ', '}
                    {!item || item === '*' ? (
                        <Highlighter search={searchQuery}>*</Highlighter>
                    ) : (
                        <StyledLink to={`/projects/${item}`}>
                            <Highlighter search={searchQuery}>
                                {item}
                            </Highlighter>
                        </StyledLink>
                    )}
                </Fragment>
            ))}
        </TextCell>
    );
};
