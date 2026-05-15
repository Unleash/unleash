import { useUiFlag } from 'hooks/useUiFlag';
import { LegacyProjectList } from './LegacyProjectList.tsx';
import { NewProjectList } from './NewProjectList.tsx';

export const ProjectList = () => {
    const newProjectListEnabled = useUiFlag('newProjectList');

    return newProjectListEnabled ? <NewProjectList /> : <LegacyProjectList />;
};
