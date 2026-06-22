import type { Story, StoryMeta } from 'component/stories/types';
import { Markdown } from 'component/common/Markdown/Markdown.tsx';
import { CodeRenderer, codeRenderSnippets } from './CodeRenderer.tsx';
import type { SdkName } from './sharedTypes.ts';

export const meta: StoryMeta = {
    title: 'Onboarding/CodeRenderer',
    background: 'paper',
};

const feature = 'my-feature-flag';
const apiKey = 'my-api-token';
const apiUrl = 'https://us.app.unleash-hosted.com/ushosted/api';

const renderSnippet = (sdkName: SdkName) => {
    const [connectSnippet] = (codeRenderSnippets[sdkName] || '')
        .replace('<YOUR_API_TOKEN>', apiKey)
        .replace('<YOUR_API_URL>', apiUrl)
        .replaceAll('<YOUR_FLAG>', feature)
        .split('---\n');

    return (
        <Markdown components={{ code: CodeRenderer }}>
            {connectSnippet}
        </Markdown>
    );
};

export const NodeJs: Story = () => renderSnippet('Node.js');
export const Go: Story = () => renderSnippet('Go');
export const DotNet: Story = () => renderSnippet('.NET');
export const Ruby: Story = () => renderSnippet('Ruby');
export const Php: Story = () => renderSnippet('PHP');
export const Rust: Story = () => renderSnippet('Rust');
export const Java: Story = () => renderSnippet('Java');
export const Python: Story = () => renderSnippet('Python');
export const JavaScript: Story = () => renderSnippet('JavaScript');
export const ReactSdk: Story = () => renderSnippet('React');
export const Vue: Story = () => renderSnippet('Vue');
export const Svelte: Story = () => renderSnippet('Svelte');
export const Swift: Story = () => renderSnippet('Swift');
export const Android: Story = () => renderSnippet('Android');
export const Flutter: Story = () => renderSnippet('Flutter');
export const NextJs: Story = () => renderSnippet('Next.js');
export const ReactNative: Story = () => renderSnippet('React Native');
