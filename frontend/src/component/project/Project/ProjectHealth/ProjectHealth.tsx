import { useHealthReport } from '../../../../hooks/api/getters/useHealthReport/useHealthReport';
import ApiError from '../../../common/ApiError/ApiError';
import ConditionallyRender from '../../../common/ConditionallyRender';
import ReportToggleList from '../../../Reporting/ReportToggleList/ReportToggleList';
import { ReportCard } from '../../../Reporting/ReportCard/ReportCard';

interface ProjectHealthProps {
    projectId: string;
}

const ProjectHealth = ({ projectId }: ProjectHealthProps) => {
    const { healthReport, refetchHealthReport, error } =
        useHealthReport(projectId);

    if (!healthReport) {
        return null;
    }

    return (
        <div>
            <ConditionallyRender
                condition={Boolean(error)}
                show={
                    <ApiError
                        data-loading
                        style={{ maxWidth: '500px', marginTop: '1rem' }}
                        onClick={refetchHealthReport}
                        text={`Could not fetch health rating for ${projectId}`}
                    />
                }
            />
            <ReportCard healthReport={healthReport} />
            <ReportToggleList
                selectedProject={projectId}
                features={healthReport.features}
            />
        </div>
    );
};

export default ProjectHealth;
