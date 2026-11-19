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
    const [text, setText] = useState(initial);
    return <ReactJSONEditor content={{ text }} onChange={setText} />;
};

export const Default: Story = () => (
    <Controlled initial={JSON.stringify(sampleJson, undefined, 2)} />
);

const ControlledWithStatusBar = () => {
    const [text, setText] = useState(JSON.stringify(sampleJson, undefined, 2));
    return <ReactJSONEditor content={{ text }} onChange={setText} statusBar />;
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
