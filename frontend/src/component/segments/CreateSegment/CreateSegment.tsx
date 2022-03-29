import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_SEGMENT } from 'component/providers/AccessProvider/permissions';
import { useSegmentsApi } from 'hooks/api/actions/useSegmentsApi/useSegmentsApi';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useSegmentForm } from '../hooks/useSegmentForm';
import { SegmentForm } from '../SegmentForm/SegmentForm';

export const CreateSegment = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const history = useHistory();
    const { createSegment, loading } = useSegmentsApi();
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
    } = useSegmentForm();

    const hasValidConstraints = useConstraintsValidation(constraints);

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/segments' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getSegmentPayload(), undefined, 2)}'`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        try {
            await createSegment(getSegmentPayload());
            await refetchSegments();
            history.push('/segments/');
            setToastData({
                title: 'Segment created',
                confetti: true,
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create segment"
            description={segmentsFormDescription}
            documentationLink={segmentsFormDocsLink}
            documentationLinkLabel="More about segments"
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
                mode="Create"
                errors={errors}
                clearErrors={clearErrors}
            >
                <CreateButton
                    name="segment"
                    permission={CREATE_SEGMENT}
                    disabled={!hasValidConstraints}
                />
            </SegmentForm>
        </FormTemplate>
    );
};

export const segmentsFormDescription = `
    Segments make it easy for you to define which of your users should get access to a feature.
    A segment is a reusable collection of constraints.
    You can create and apply a segment when configuring activation strategies for a feature toggle or at any time from the segments page in the navigation menu.
`;

// TODO(olav): Update link when the segments docs are ready.
export const segmentsFormDocsLink = 'https://docs.getunleash.io';
