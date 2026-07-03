import { useState } from 'react';
import { useNavigate } from 'react-router';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { useImportApi } from 'hooks/api/actions/useImportApi/useImportApi';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    buildDemoImportPayload,
    DEMO_PROJECT_DESCRIPTION,
    DEMO_PROJECT_ID,
    DEMO_PROJECT_NAME,
    DEMO_SEGMENT,
    withoutSegments,
} from './demoProjectTemplate.ts';

const DEMO_PROJECT_PATH = `/projects/${DEMO_PROJECT_ID}`;
const PREFERRED_ENVIRONMENT = 'development';

const resolveEnvironment = (projectEnvironments?: string[]): string => {
    const environments = (projectEnvironments ?? []).filter(
        (environment) => environment !== 'default',
    );
    if (environments.includes(PREFERRED_ENVIRONMENT)) {
        return PREFERRED_ENVIRONMENT;
    }
    return environments[0] ?? projectEnvironments?.[0] ?? PREFERRED_ENVIRONMENT;
};

const isAlreadyExistsError = (error: unknown): boolean =>
    error instanceof Error && /exist/i.test(error.message);

export const useSeedDemoProject = () => {
    const { projects, refetch: refetchProjects } = useProjects();
    const { createProject } = useProjectApi();
    const { createImport } = useImportApi();
    const { createSegment } = useSegmentsApi();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const [seeding, setSeeding] = useState(false);

    const seedDemoProject = async () => {
        if (seeding) {
            return;
        }

        if (projects.some((project) => project.id === DEMO_PROJECT_ID)) {
            setToastData({
                type: 'success',
                text: 'The example project already exists - taking you there.',
            });
            navigate(DEMO_PROJECT_PATH);
            return;
        }

        setSeeding(true);
        try {
            let projectEnvironments: string[] | undefined;
            let targetProject = DEMO_PROJECT_ID;
            try {
                const created = await createProject({
                    id: DEMO_PROJECT_ID,
                    name: DEMO_PROJECT_NAME,
                    description: DEMO_PROJECT_DESCRIPTION,
                });
                projectEnvironments = created.environments;
            } catch (error) {
                if (isAlreadyExistsError(error)) {
                    // Created in the meantime (or by someone else): just go there.
                    setToastData({
                        type: 'success',
                        text: 'The example project already exists - taking you there.',
                    });
                    navigate(DEMO_PROJECT_PATH);
                    return;
                }
                // Project creation is not available on OSS instances (the
                // route only exists on Pro/Enterprise). Seed into an existing
                // project instead of failing outright.
                const fallback =
                    projects.find((project) => project.id === 'default') ??
                    projects[0];
                if (!fallback) {
                    throw error;
                }
                targetProject = fallback.id;
            }

            // The import endpoint only maps segments by name to existing
            // segments, so the demo segment has to be created up front. If it
            // fails (already exists, missing permission) we still try to
            // import - with a segment-free fallback below.
            let segmentAvailable = true;
            try {
                await createSegment(DEMO_SEGMENT);
            } catch (error) {
                segmentAvailable = isAlreadyExistsError(error);
            }

            const payload = buildDemoImportPayload(
                resolveEnvironment(projectEnvironments),
                targetProject,
            );
            try {
                await createImport(
                    segmentAvailable ? payload : withoutSegments(payload),
                );
            } catch (error) {
                if (!segmentAvailable) {
                    throw error;
                }
                // The segment may still be unusable (e.g. bound to another
                // project); retry once without segment references.
                await createImport(withoutSegments(payload));
            }

            refetchProjects();
            setToastData({
                type: 'success',
                text:
                    targetProject === DEMO_PROJECT_ID
                        ? 'Example project created. Take a look around and explore the flags!'
                        : `Example flags seeded into the "${targetProject}" project. Take a look around and explore them!`,
            });
            navigate(`/projects/${targetProject}`);
        } catch (error) {
            setToastApiError(
                `Could not create the example project: ${formatUnknownError(error)}`,
            );
        } finally {
            setSeeding(false);
        }
    };

    return { seedDemoProject, seeding };
};
