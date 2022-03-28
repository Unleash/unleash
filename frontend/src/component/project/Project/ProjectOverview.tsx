import useProject from 'hooks/api/getters/useProject/useProject';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { useStyles } from './Project.styles';

interface ProjectOverviewProps {
    projectId: string;
}

const ProjectOverview = ({ projectId }: ProjectOverviewProps) => {
    const { project, loading } = useProject(projectId, {
        refreshInterval: 10000,
    });
    const { members, features, health, description } = project;
    const styles = useStyles();

    return (
        <div>
            <div className={styles.containerStyles}>
                <ProjectInfo
                    id={projectId}
                    description={description}
                    memberCount={members}
                    health={health}
                    featureCount={features?.length}
                />
                <div className={styles.projectToggles}>
                    <ProjectFeatureToggles
                        features={features}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;
