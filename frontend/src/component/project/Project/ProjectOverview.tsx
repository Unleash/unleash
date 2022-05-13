import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useProject from 'hooks/api/getters/useProject/useProject';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import { ProjectFeatureToggles as LegacyProjectFeatureToggles } from './ProjectFeatureToggles/LegacyProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { useStyles } from './Project.styles';

interface IProjectOverviewProps {
    projectId: string;
}

const ProjectOverview = ({ projectId }: IProjectOverviewProps) => {
    const { project, loading } = useProject(projectId, {
        refreshInterval: 10000,
    });
    const { members, features, health, description, environments } = project;
    const { classes: styles } = useStyles();
    const { uiConfig } = useUiConfig();

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
                    <ConditionallyRender
                        condition={uiConfig.flags.NEW_PROJECT_OVERVIEW}
                        show={() => (
                            <ProjectFeatureToggles
                                features={features}
                                environments={environments}
                                loading={loading}
                            />
                        )}
                        elseShow={() => (
                            <LegacyProjectFeatureToggles
                                features={features}
                                loading={loading}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;
