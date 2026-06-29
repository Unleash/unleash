import { useUiFlag } from 'hooks/useUiFlag';
import type { ProjectSchema } from 'openapi';
import { LegacyProjectCard } from './LegacyProjectCard.tsx';
import { NewProjectCard } from './NewProjectCard.tsx';

export const ProjectCard = (props: ProjectSchema) => {
    const newProjectListEnabled = useUiFlag('newProjectList');
    return newProjectListEnabled ? (
        <NewProjectCard {...props} />
    ) : (
        <LegacyProjectCard {...props} />
    );
};
