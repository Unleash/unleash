import React, { Suspense, useState } from 'react';
import { Alert, Button, styled, Tab, Tabs, Typography } from '@mui/material';
import { tabClasses } from '@mui/material/Tab';
import { useNavigate } from 'react-router';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
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
import { findPayloadSchemaTemplate } from './payloadSchemaTemplates';
import { PayloadSchemaTemplateList } from './PayloadSchemaTemplateList';
import { usePayloadSchemaForm } from './usePayloadSchemaForm.ts';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const LazyPayloadSchemaPreview = React.lazy(() =>
    import('./PayloadSchemaPreview.tsx').then((module) => ({
        default: module.PayloadSchemaPreview,
    })),
);

const StyledSchemaSourceRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const Pill = styled(Tab)(({ theme }) => ({
    minHeight: 0,
    minWidth: 0,
    height: theme.spacing(4),
    padding: theme.spacing(0, 1.75),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    background: theme.palette.background.paper,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
    [`&.${tabClasses.selected}`]: {
        borderColor: theme.palette.primary.containerBorder,
        background: theme.palette.primary.container,
        color: theme.palette.primary.onContainer,
    },
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

type SchemaSource = 'template' | 'import';

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
    const [schemaSource, setSchemaSource] = useState<SchemaSource>('template');
    const isCreateMode = !feature.payloadSchema;

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
                isCreateMode ? 'Create payload schema' : 'Edit payload schema'
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
                        Save {isCreateMode ? 'schema' : 'changes'}
                    </PermissionButton>
                </StyledButtons>
            }
        >
            {isCreateMode ? (
                <>
                    <Alert severity='info' sx={{ mb: 2 }}>
                        <strong>Where you use this schema:</strong> when you add
                        a strategy to a flag, add a variant, set its payload
                        type to JSON and choose this schema. The variant's
                        payload is then checked against it.
                    </Alert>
                    <StyledSchemaSourceRow>
                        <Typography variant='body2'>Start from</Typography>
                        <Tabs
                            value={schemaSource}
                            onChange={(_event, value) => setSchemaSource(value)}
                            aria-label='Start from'
                            sx={{ minHeight: 0, overflow: 'visible' }}
                            slotProps={{
                                indicator: { sx: { display: 'none' } },
                                scroller: { style: { overflow: 'visible' } },
                                list: { sx: { flexWrap: 'wrap', gap: 1 } },
                            }}
                        >
                            <Pill value='template' label='Use a template' />
                            <Pill value='import' label='Import JSON Schema' />
                        </Tabs>
                    </StyledSchemaSourceRow>
                </>
            ) : null}

            <StyledSplit>
                <StyledPane>
                    {isCreateMode && schemaSource === 'template' ? (
                        <PayloadSchemaTemplateList
                            templateKey={templateKey}
                            disabled={!editable}
                            onSelect={applyTemplate}
                        />
                    ) : (
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
                    )}
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
