import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Fragment, type FC } from 'react';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.links,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

interface IProjectsListProps {
    project?: string;
    projects?: string | string[];
}

export const ProjectsList: FC<IProjectsListProps> = ({ projects, project }) => {
    const { searchQuery } = useSearchHighlightContext();

    const projectsList =
        projects && Array.isArray(projects) && projects.length > 1
            ? projects
            : [];

    if (projectsList.length > 0) {
        return (
            <TextCell>
                <HtmlTooltip
                    title={projectsList.map((item, index) => (
                        <Fragment key={item}>
                            {index > 0 && ', '}
                            {!item || item === '*' ? (
                                <Highlighter search={searchQuery}>
                                    *
                                </Highlighter>
                            ) : (
                                <StyledLink to={`/projects/${item}`}>
                                    <Highlighter search={searchQuery}>
                                        {item}
                                    </Highlighter>
                                </StyledLink>
                            )}
                        </Fragment>
                    ))}
                    placement='bottom-start'
                    arrow
                    tabIndex={0}
                >
                    <span>{`${projectsList.length}`} projects</span>
                </HtmlTooltip>
            </TextCell>
        );
    }

    if ((projects?.length === 1 && projects?.[0] === '*') || project === '*') {
        return (
            <TextCell>
                <HtmlTooltip
                    title='ALL current and future projects'
                    placement='bottom'
                    arrow
                >
                    <span>
                        <Highlighter search={searchQuery}>*</Highlighter>
                    </span>
                </HtmlTooltip>
            </TextCell>
        );
    }

    if (projectsList.length === 1 || project) {
        const item = project || projectsList[0];

        return <LinkCell to={`/projects/${item}`} title={item} />;
    }

    return '';
};
