import { useHealthReport } from 'hooks/api/getters/useHealthReport/useHealthReport';
import ApiError from 'component/common/ApiError/ApiError';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReportCard } from './ReportTable/ReportCard/ReportCard';
import { ReportTable } from './ReportTable/ReportTable';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';

const ProjectHealth = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    usePageTitle(`Project health – ${projectName}`);

    const { healthReport, refetchHealthReport, error } = useHealthReport(
        projectId,
        { refreshInterval: 15 * 1000 },
    );

    if (!healthReport) {
        return null;
    }

    return (
        <div>
            {error ? (
                <ApiError
                    data-loading
                    style={{ maxWidth: '500px', marginTop: '1rem' }}
                    onClick={refetchHealthReport}
                    text={`Could not fetch health rating for ${projectId}`}
                />
            ) : null}
            <ReportCard healthReport={healthReport} />
            <ReportTable
                projectId={projectId}
                features={healthReport.features}
            />
        </div>
    );
};

export default ProjectHealth;
