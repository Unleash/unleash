import React, { Suspense, useState } from 'react';
import { Button, styled } from '@mui/material';
import { useNavigate } from 'react-router';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import type { JSONContent } from 'component/common/ReactJSONEditor/ReactJSONEditor';
import { formatFeaturePath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { usePayloadSchemaApi } from 'hooks/api/actions/usePayloadSchemaApi/usePayloadSchemaApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    findPayloadSchemaTemplate,
    payloadSchemaTemplateGroups,
} from './payloadSchemaTemplates';
import { usePayloadSchemaForm } from './usePayloadSchemaForm.ts';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledTemplateRow = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

const templateOptions = payloadSchemaTemplateGroups.map((group) => ({
    groupHeader: group.groupHeader,
    options: group.templates.map((template) => ({
        key: template.key,
        label: template.label,
    })),
}));

interface IPayloadSchemaFormProps {
    projectId: string;
    featureId: string;
    feature: IFeatureToggle;
    refetchFeature: () => void;
}

const PayloadSchemaForm = ({
    projectId,
    featureId,
    feature,
    refetchFeature,
}: IPayloadSchemaFormProps) => {
    const { upsertPayloadSchema } = usePayloadSchemaApi(projectId, featureId);
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { state, editable, canSave, edit, save } = usePayloadSchemaForm(
        feature.payloadSchema,
    );
    const [templateKey, setTemplateKey] = useState('');

    const applyTemplate = (key: string) => {
        setTemplateKey(key);
        const template = findPayloadSchemaTemplate(key);
        if (template) {
            edit({ json: template.schema });
        }
    };

    const editContent = (newContent: JSONContent) => {
        edit(newContent);
        setTemplateKey('');
    };

    const closeSidebar = () =>
        navigate(formatFeaturePath(projectId, featureId));

    const saveAndClose = async () => {
        try {
            const next = await save(upsertPayloadSchema);
            if (next.status === 'saved') {
                setToastData({ type: 'success', text: 'Payload schema saved' });
                refetchFeature();
                closeSidebar();
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <FormTemplate
            layout='modal'
            title={
                feature.payloadSchema
                    ? 'Edit payload schema'
                    : 'Add payload schema'
            }
            description="A JSON Schema (draft 2020-12) that the payloads of this flag's variants have to match."
            documentationLink='https://json-schema.org/learn/getting-started-step-by-step'
            documentationLinkLabel='JSON Schema guide'
            footer={
                <StyledButtons>
                    <Button onClick={closeSidebar}>Cancel</Button>
                    <PermissionButton
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                        disabled={!canSave}
                        onClick={saveAndClose}
                    >
                        Save
                    </PermissionButton>
                </StyledButtons>
            }
        >
            <StyledTemplateRow>
                <GeneralSelect
                    label='Start from a template'
                    options={templateOptions}
                    value={templateKey}
                    onChange={applyTemplate}
                    disabled={!editable}
                    fullWidth
                />
            </StyledTemplateRow>
            <Suspense fallback={null}>
                <LazyReactJSONEditor
                    content={state.content}
                    validationError={
                        state.status === 'rejected' ? state.error : undefined
                    }
                    onChange={editContent}
                    readOnly={!editable}
                />
            </Suspense>
        </FormTemplate>
    );
};

export const PayloadSchemaSidebar = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature, loading, error } = useFeature(
        projectId,
        featureId,
    );

    return !loading && !error ? (
        <PayloadSchemaForm
            projectId={projectId}
            featureId={featureId}
            feature={feature}
            refetchFeature={refetchFeature}
        />
    ) : null;
};
