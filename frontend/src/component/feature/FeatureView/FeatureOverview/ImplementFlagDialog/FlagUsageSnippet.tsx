import { Alert } from '@mui/material';
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

export const FlagUsageSnippetError = () => (
    <Alert severity='error'>
        This SDK is missing a flag usage example. Please let us know so we can
        add one!
    </Alert>
);

export const FlagUsageSnippet = ({
    sdkName,
    feature,
}: FlagUsageSnippetProps) => {
    const snippet = buildFlagUsageSnippet(codeRenderSnippets[sdkName], feature);

    if (snippet === null) return <FlagUsageSnippetError />;

    return <Markdown components={{ code: CodeRenderer }}>{snippet}</Markdown>;
};
