import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { UPDATE_SEGMENT } from 'component/providers/AccessProvider/permissions';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useSegmentForm } from '../hooks/useSegmentForm';
import { SegmentForm } from '../SegmentForm/SegmentForm';
import { segmentsFormDescription } from 'component/segments/CreateSegment/CreateSegment';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { segmentsDocsLink } from 'component/segments/SegmentDocs/SegmentDocs';
import { useSegmentValuesCount } from 'component/segments/hooks/useSegmentValuesCount';
import { SEGMENT_SAVE_BTN_ID } from 'utils/testIds';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';

export const EditSegment = () => {
    const segmentId = useRequiredPathParam('segmentId');
    const { segment } = useSegment(Number(segmentId));
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
        constraints,
        setConstraints,
        getSegmentPayload,
        errors,
        clearErrors,
    } = useSegmentForm(
        segment?.name,
        segment?.description,
        segment?.constraints
    );

    const hasValidConstraints = useConstraintsValidation(constraints);
    const segmentValuesCount = useSegmentValuesCount(constraints);
    const { segmentValuesLimit } = useSegmentLimits();

    const overSegmentValuesLimit: boolean = Boolean(
        segmentValuesLimit && segmentValuesCount > segmentValuesLimit
    );

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/segments/${segmentId}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getSegmentPayload(), undefined, 2)}'`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        if (segment) {
            e.preventDefault();
            clearErrors();
            try {
                await updateSegment(segment.id, getSegmentPayload());
                await refetchSegments();
                navigate('/segments/');
                setToastData({
                    title: 'Segment updated',
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
            title="Edit segment"
            description={segmentsFormDescription}
            documentationLink={segmentsDocsLink}
            documentationLinkLabel="Segments documentation"
            formatApiCode={formatApiCode}
        >
            <SegmentForm
                handleSubmit={handleSubmit}
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                constraints={constraints}
                setConstraints={setConstraints}
                errors={errors}
                clearErrors={clearErrors}
                mode="edit"
            >
                <UpdateButton
                    permission={UPDATE_SEGMENT}
                    disabled={!hasValidConstraints || overSegmentValuesLimit}
                    data-testid={SEGMENT_SAVE_BTN_ID}
                />
            </SegmentForm>
        </FormTemplate>
    );
};
