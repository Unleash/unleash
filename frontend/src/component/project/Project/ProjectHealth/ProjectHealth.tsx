import useHealthReport from '../../../../hooks/api/getters/useHealthReport/useHealthReport';
import ApiError from '../../../common/ApiError/ApiError';
import ConditionallyRender from '../../../common/ConditionallyRender';
import ReportCardContainer from '../../../Reporting/ReportCard/ReportCardContainer'
import ReportToggleList from '../../../Reporting/ReportToggleList/ReportToggleList'

interface ProjectHealthProps {
    projectId: string;
}

const ProjectHealth = ({ projectId }: ProjectHealthProps) => {
    const { project, error, refetch } = useHealthReport(projectId);

    return (
        <div>
            <ConditionallyRender
                condition={error}
                show={
                    <ApiError
                        data-loading
                        style={{ maxWidth: '500px', marginTop: '1rem' }}
                        onClick={refetch}
                        text={`Could not fetch health rating for ${projectId}`}
                    />
                }
            />
            <ReportCardContainer
                    health={project?.health}
                    staleCount={project?.staleCount}
                    activeCount={project?.activeCount}
                    potentiallyStaleCount={project?.potentiallyStaleCount}
                    selectedProject={project.name}
            />
            <ReportToggleList
                features={project.features}
                selectedProject={projectId}
            />
        </div>
    )
}

export default ProjectHealth;