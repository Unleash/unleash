import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import {
    UPDATE_PROJECT_SEGMENT,
    UPDATE_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useSegmentForm } from '../hooks/useSegmentForm.ts';
import { SegmentForm } from '../SegmentForm.tsx';
import { segmentsFormDescription } from 'component/segments/CreateSegment/CreateSegment';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { segmentsDocsLink } from 'component/segments/SegmentDocs';
import { useSegmentValuesCount } from 'component/segments/hooks/useSegmentValuesCount';
import { SEGMENT_SAVE_BTN_ID } from 'utils/testIds';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useHighestPermissionChangeRequestEnvironment } from 'hooks/useHighestPermissionChangeRequestEnvironment';
import type { ISegment } from 'interfaces/segment.ts';
import { constraintId } from 'constants/constraintId.ts';
import { apiPayloadConstraintReplacer } from 'utils/api-payload-constraint-replacer.ts';

interface IEditSegmentProps {
    modal?: boolean;
}

const addIdSymbolToConstraints = (segment?: ISegment): ISegment | undefined => {
    if (!segment) return;

    const constraints = segment.constraints.map((constraint) => {
        return { ...constraint, [constraintId]: crypto.randomUUID() };
    });

    return { ...segment, constraints };
};

export const EditSegment = ({ modal }: IEditSegmentProps) => {
    const projectId = useOptionalPathParam('projectId');
    const segmentId = useRequiredPathParam('segmentId');
    const { segment: segmentWithoutConstraintIds } = useSegment(
        Number(segmentId),
    );
    const segment = addIdSymbolToConstraints(segmentWithoutConstraintIds);
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { updateSegment, loading } = useSegmentsApi();
    const { refetchSegments } = useSegments();

    const {
        name,
        setName,
        description,
        setDescription,
        project,
        setProject,
        constraints,
        setConstraints,
        getSegmentPayload,
        errors,
        clearErrors,
    } = useSegmentForm(
        segment?.name,
        segment?.description,
        segment?.project,
        segment?.constraints,
    );

    const hasValidConstraints = useConstraintsValidation(constraints);
    const segmentValuesCount = useSegmentValuesCount(constraints);
    const { segmentValuesLimit } = useSegmentLimits();

    const overSegmentValuesLimit: boolean = Boolean(
        segmentValuesLimit && segmentValuesCount > segmentValuesLimit,
    );

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/segments/${segmentId}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getSegmentPayload(), apiPayloadConstraintReplacer, 2)}'`;
    };

    const highestPermissionChangeRequestEnv =
        useHighestPermissionChangeRequestEnvironment(segment?.project);
    const changeRequestEnv = highestPermissionChangeRequestEnv();
    const { addChange } = useChangeRequestApi();

    const handleSubmit = async (e: React.FormEvent) => {
        if (segment) {
            e.preventDefault();
            clearErrors();
            try {
                if (changeRequestEnv) {
                    await addChange(segment.project || '', changeRequestEnv, {
                        action: 'updateSegment',
                        feature: null,
                        payload: { id: segment.id, ...getSegmentPayload() },
                    });
                } else {
                    await updateSegment(segment.id, getSegmentPayload());
                }
                refetchSegments();
                if (projectId) {
                    navigate(`/projects/${projectId}/settings/segments/`);
                } else {
                    navigate('/segments/');
                }
                setToastData({
                    text: `Segment ${
                        changeRequestEnv ? 'change added to draft' : 'updated'
                    }`,
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    return (
        <FormTemplate
            loading={loading}
            modal={modal}
            title='Edit segment'
            description={segmentsFormDescription}
            documentationLink={segmentsDocsLink}
            documentationLinkLabel='Segments documentation'
            formatApiCode={formatApiCode}
        >
            <SegmentForm
                handleSubmit={handleSubmit}
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                project={project}
                setProject={setProject}
                constraints={constraints}
                setConstraints={setConstraints}
                errors={errors}
                clearErrors={clearErrors}
                mode='edit'
            >
                <UpdateButton
                    permission={[UPDATE_SEGMENT, UPDATE_PROJECT_SEGMENT]}
                    projectId={projectId}
                    disabled={!hasValidConstraints || overSegmentValuesLimit}
                    data-testid={SEGMENT_SAVE_BTN_ID}
                >
                    {changeRequestEnv ? 'Add to draft' : 'Save'}
                </UpdateButton>
            </SegmentForm>
        </FormTemplate>
    );
};
