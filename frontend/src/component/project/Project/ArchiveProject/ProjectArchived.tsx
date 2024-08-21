import { Link } from 'react-router-dom';
import type { FC } from 'react';

export const ProjectArchived: FC<{ name: string }> = ({ name }) => {
    return (
        <p>
            The project <strong>{name}</strong> has been archived. You can find
            it on the{' '}
            <Link to={`/projects-archive`}>archive page for projects</Link>.
        </p>
    );
};
