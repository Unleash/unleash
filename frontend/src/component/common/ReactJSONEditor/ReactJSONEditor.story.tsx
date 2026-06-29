import { useState } from 'react';
import type { Story, StoryMeta } from 'component/stories/types';
import ReactJSONEditor from './ReactJSONEditor';

export const meta: StoryMeta = {
    title: 'Common/ReactJSONEditor',
};

const sampleJson = {
    name: 'example',
    enabled: true,
    value: 42,
    tags: ['a', 'b'],
};

const Controlled = ({ initial }: { initial: string }) => {
    const [content, setContent] = useState<{ text: string }>({ text: initial });
    return (
        <ReactJSONEditor
            content={content}
            onChange={(c) => setContent(c as { text: string })}
        />
    );
};

export const Default: Story = () => (
    <Controlled initial={JSON.stringify(sampleJson, undefined, 2)} />
);

const ControlledWithStatusBar = () => {
    const [content, setContent] = useState<{ text: string }>({
        text: JSON.stringify(sampleJson, undefined, 2),
    });
    return (
        <ReactJSONEditor
            content={content}
            onChange={(c) => setContent(c as { text: string })}
            statusBar
        />
    );
};

export const WithStatusBar: Story = () => <ControlledWithStatusBar />;

export const ReadOnly: Story = () => (
    <ReactJSONEditor content={{ json: sampleJson }} readOnly />
);

export const WithValidationError: Story = () => (
    <ReactJSONEditor
        content={{ text: '{ "key": "value" }' }}
        validationError='Custom validation error: value must be a number'
    />
);

export const InvalidJson: Story = () => (
    <Controlled initial='{ invalid json }' />
);

export const Empty: Story = () => <Controlled initial='' />;
