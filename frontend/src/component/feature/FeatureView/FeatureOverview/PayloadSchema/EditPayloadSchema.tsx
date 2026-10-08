import React, { Suspense, useState } from 'react';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';

const LazyReactJSONEditor = React.lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

export const EditPayloadSchema = () => {
    const [text, setText] = useState('');

    return (
        <FormTemplate
            modal
            title='Edit payload schema'
            description="A JSON Schema (draft 2020-12) that the payloads of this flag's variants have to match."
            documentationLink='https://json-schema.org/learn/getting-started-step-by-step'
            documentationLinkLabel='JSON Schema guide'
        >
            <Suspense fallback={null}>
                <LazyReactJSONEditor
                    content={{ text }}
                    onChange={(content) => {
                        if ('text' in content) {
                            setText(content.text);
                        }
                    }}
                />
            </Suspense>
        </FormTemplate>
    );
};
