import React, { Suspense, useState } from 'react';
import { styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import type { JSONContent } from 'component/common/ReactJSONEditor/ReactJSONEditor';
import {
    findPayloadSchemaTemplate,
    payloadSchemaTemplateGroups,
} from './payloadSchemaTemplates';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledTemplateRow = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const templateOptions = payloadSchemaTemplateGroups.map((group) => ({
    groupHeader: group.groupHeader,
    options: group.templates.map((template) => ({
        key: template.key,
        label: template.label,
    })),
}));

export const PayloadSchemaSidebar = () => {
    const [content, setContent] = useState<JSONContent>({ text: '' });
    const [templateKey, setTemplateKey] = useState('');

    const applyTemplate = (key: string) => {
        setTemplateKey(key);
        const template = findPayloadSchemaTemplate(key);
        if (template) {
            setContent({ json: template.schema });
        }
    };

    const editContent = (newContent: JSONContent) => {
        setContent(newContent);
        setTemplateKey('');
    };

    return (
        <FormTemplate
            modal
            title='Edit payload schema'
            description="A JSON Schema (draft 2020-12) that the payloads of this flag's variants have to match."
            documentationLink='https://json-schema.org/learn/getting-started-step-by-step'
            documentationLinkLabel='JSON Schema guide'
        >
            <StyledTemplateRow>
                <GeneralSelect
                    label='Start from a template'
                    options={templateOptions}
                    value={templateKey}
                    onChange={applyTemplate}
                    fullWidth
                />
            </StyledTemplateRow>
            <Suspense fallback={null}>
                <LazyReactJSONEditor content={content} onChange={editContent} />
            </Suspense>
        </FormTemplate>
    );
};
