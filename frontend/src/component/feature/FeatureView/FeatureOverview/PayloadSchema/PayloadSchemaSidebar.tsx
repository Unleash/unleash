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

const LazyPayloadSchemaPreview = React.lazy(() =>
    import('./PayloadSchemaPreview.tsx').then((module) => ({
        default: module.PayloadSchemaPreview,
    })),
);

const StyledTemplateRow = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

const StyledSplit = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    gap: theme.spacing(2.5),
    flex: 1,
    [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
    },
}));

const StyledPane = styled('div')(({ theme }) => ({
    minWidth: 0,
    minHeight: 0,
    height: 400,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    '& > *': {
        height: '100%',
    },
    [theme.breakpoints.up('sm')]: {
        flex: 1,
        height: '100%',
    },
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
    const { state, editable, canSave, parsedSchema, edit, save } =
        usePayloadSchemaForm(feature.payloadSchema);
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
            fitContainerHeight
            title={
                feature.payloadSchema
                    ? 'Edit payload schema'
                    : 'Create payload schema'
            }
            showGuidance={false}
            description=''
            footer={
                <StyledButtons>
                    <Button onClick={closeSidebar}>Cancel</Button>
                    <PermissionButton
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                        disabled={!canSave}
                        onClick={saveAndClose}
                    >
                        Save schema
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
            <StyledSplit>
                <StyledPane>
                    <Suspense fallback={null}>
                        <LazyReactJSONEditor
                            content={state.content}
                            validationError={
                                state.status === 'rejected'
                                    ? state.error
                                    : undefined
                            }
                            onChange={editContent}
                            readOnly={!editable}
                            editorStyle='fill'
                        />
                    </Suspense>
                </StyledPane>
                <StyledPane>
                    <Suspense fallback={null}>
                        <LazyPayloadSchemaPreview schema={parsedSchema} />
                    </Suspense>
                </StyledPane>
            </StyledSplit>
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
