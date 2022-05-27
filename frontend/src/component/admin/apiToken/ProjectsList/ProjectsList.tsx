import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Fragment, VFC } from 'react';
import { Link } from 'react-router-dom';

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
        return <Highlighter search={searchQuery}>*</Highlighter>;
    }

    return (
        <>
            {fields.map((item, index) => (
                <Fragment key={item}>
                    {index > 0 && ', '}
                    {!item || item === '*' ? (
                        <Highlighter search={searchQuery}>*</Highlighter>
                    ) : (
                        <Link to={`/projects/${item}`}>
                            <Highlighter search={searchQuery}>
                                {item}
                            </Highlighter>
                        </Link>
                    )}
                </Fragment>
            ))}
        </>
    );
};
