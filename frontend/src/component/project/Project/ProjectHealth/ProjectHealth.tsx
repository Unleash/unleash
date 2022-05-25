import { useHealthReport } from 'hooks/api/getters/useHealthReport/useHealthReport';
import ApiError from 'component/common/ApiError/ApiError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ReportCard } from 'component/Reporting/ReportCard/ReportCard';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReportTable } from 'component/Reporting/ReportTable/ReportTable';

interface IProjectHealthProps {
    projectId: string;
}

const ProjectHealth = ({ projectId }: IProjectHealthProps) => {
    usePageTitle('Project health');

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
            <ReportTable
                projectId={projectId}
                features={healthReport.features}
            />
        </div>
    );
};

export default ProjectHealth;
