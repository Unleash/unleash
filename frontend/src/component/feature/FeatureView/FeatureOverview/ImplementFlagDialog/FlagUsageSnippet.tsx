import { Markdown } from 'component/common/Markdown/Markdown';
import {
    CodeRenderer,
    codeRenderSnippets,
} from 'component/onboarding/dialog/CodeRenderer';
import type { SdkName } from 'component/onboarding/dialog/sharedTypes';
import { buildFlagUsageSnippet } from './buildFlagUsageSnippet.ts';

interface FlagUsageSnippetProps {
    sdkName: SdkName;
    feature: string;
}

export const FlagUsageSnippet = ({
    sdkName,
    feature,
}: FlagUsageSnippetProps) => {
    const snippet = buildFlagUsageSnippet(codeRenderSnippets[sdkName], feature);

    return <Markdown components={{ code: CodeRenderer }}>{snippet}</Markdown>;
};
