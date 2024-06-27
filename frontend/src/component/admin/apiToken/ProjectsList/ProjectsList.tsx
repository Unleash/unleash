import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Fragment, type VFC } from 'react';
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

export const ProjectsList: VFC<IProjectsListProps> = ({
    projects,
    project,
}) => {
    const { searchQuery } = useSearchHighlightContext();
    const fields: string[] =
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

    const fieldsHead = fields.length < 5 ? fields : fields.slice(0, 3);
    const fieldsTail = fields.length < 5 ? [] : fields.slice(3);

    return (
        <TextCell>
            {fieldsHead.map((item, index) => (
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
            <ConditionallyRender
                condition={fieldsTail.length > 0}
                show={
                    <>
                        {', '}
                        <HtmlTooltip
                            title={fieldsTail.map((item, index) => (
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
                        >
                            <span>+{`${fieldsTail.length}`} more</span>
                        </HtmlTooltip>
                    </>
                }
            />
        </TextCell>
    );
};
