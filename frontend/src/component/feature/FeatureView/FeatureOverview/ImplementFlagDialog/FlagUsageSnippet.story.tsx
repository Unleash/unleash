import type { Story, StoryMeta } from 'component/stories/types';
import type { SdkName } from 'component/onboarding/dialog/sharedTypes';
import { FlagUsageSnippet } from './FlagUsageSnippet';

export const meta: StoryMeta = {
    title: 'Onboarding/ImplementFlagDialog/FlagUsageSnippet',
    background: 'paper',
};

const feature = 'my-feature-flag';

export const NodeJs: Story = () => (
    <FlagUsageSnippet sdkName='Node.js' feature={feature} />
);

export const Go: Story = () => (
    <FlagUsageSnippet sdkName='Go' feature={feature} />
);

export const DotNet: Story = () => (
    <FlagUsageSnippet sdkName='.NET' feature={feature} />
);

export const Ruby: Story = () => (
    <FlagUsageSnippet sdkName='Ruby' feature={feature} />
);

export const Php: Story = () => (
    <FlagUsageSnippet sdkName='PHP' feature={feature} />
);

export const Rust: Story = () => (
    <FlagUsageSnippet sdkName='Rust' feature={feature} />
);

export const Java: Story = () => (
    <FlagUsageSnippet sdkName='Java' feature={feature} />
);

export const Python: Story = () => (
    <FlagUsageSnippet sdkName='Python' feature={feature} />
);

export const JavaScript: Story = () => (
    <FlagUsageSnippet sdkName='JavaScript' feature={feature} />
);

export const React: Story = () => (
    <FlagUsageSnippet sdkName='React' feature={feature} />
);

export const Vue: Story = () => (
    <FlagUsageSnippet sdkName='Vue' feature={feature} />
);

export const Svelte: Story = () => (
    <FlagUsageSnippet sdkName='Svelte' feature={feature} />
);

export const Swift: Story = () => (
    <FlagUsageSnippet sdkName='Swift' feature={feature} />
);

export const Android: Story = () => (
    <FlagUsageSnippet sdkName='Android' feature={feature} />
);

export const Flutter: Story = () => (
    <FlagUsageSnippet sdkName='Flutter' feature={feature} />
);

export const MissingSnippet: Story = () => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <FlagUsageSnippet
        sdkName={'Unknown' as SdkName}
        feature='my-feature-flag'
    />
);
