import type { FC, ComponentProps, ReactNode } from 'react';
import copy from 'copy-to-clipboard';
import useToast from 'hooks/useToast';
import { IconButton, styled, Tooltip } from '@mui/material';
import CopyIcon from '@mui/icons-material/FileCopy';
import type { SdkName } from './sharedTypes.ts';
import android from './snippets/android.md?raw';
import go from './snippets/go.md?raw';
import javascript from './snippets/javascript.md?raw';
import nodejs from './snippets/nodejs.md?raw';
import python from './snippets/python.md?raw';
import ruby from './snippets/ruby.md?raw';
import svelte from './snippets/svelte.md?raw';
import vue from './snippets/vue.md?raw';
import flutter from './snippets/flutter.md?raw';
import java from './snippets/java.md?raw';
import dotnet from './snippets/dotnet.md?raw';
import php from './snippets/php.md?raw';
import react from './snippets/react.md?raw';
import rust from './snippets/rust.md?raw';
import swift from './snippets/swift.md?raw';
import nextjs from './snippets/nextjs.md?raw';
import reactnative from './snippets/reactnative.md?raw';
import type ReactMarkdown from 'react-markdown';
import type { ExtraProps } from 'react-markdown';
import rehypeHighlightLib from 'rehype-highlight';

import hljsGo from 'highlight.js/lib/languages/go';
import hljsJava from 'highlight.js/lib/languages/java';
import hljsJavaScript from 'highlight.js/lib/languages/javascript';
import hljsKotlin from 'highlight.js/lib/languages/kotlin';
import hljsPhp from 'highlight.js/lib/languages/php';
import hljsPython from 'highlight.js/lib/languages/python';
import hljsRuby from 'highlight.js/lib/languages/ruby';
import hljsRust from 'highlight.js/lib/languages/rust';
import hljsSwift from 'highlight.js/lib/languages/swift';
import hljsTypeScript from 'highlight.js/lib/languages/typescript';
import hljsCSharp from 'highlight.js/lib/languages/csharp';
import hljsDart from 'highlight.js/lib/languages/dart';
import hljsBash from 'highlight.js/lib/languages/bash';
import hljsXml from 'highlight.js/lib/languages/xml';
import hljsGroovy from 'highlight.js/lib/languages/groovy';

export const codeRenderSnippets: Record<SdkName, string> = {
    Android: android,
    Go: go,
    JavaScript: javascript,
    'Node.js': nodejs,
    Python: python,
    Ruby: ruby,
    Svelte: svelte,
    Vue: vue,
    Flutter: flutter,
    Java: java,
    '.NET': dotnet,
    PHP: php,
    React: react,
    Rust: rust,
    Swift: swift,
    'Next.js': nextjs,
    'React Native': reactnative,
};

export const rehypeHighlightPlugins: ComponentProps<
    typeof ReactMarkdown
>['rehypePlugins'] = [
    [
        rehypeHighlightLib,
        {
            languages: {
                go: hljsGo,
                java: hljsJava,
                javascript: hljsJavaScript,
                kotlin: hljsKotlin,
                php: hljsPhp,
                python: hljsPython,
                ruby: hljsRuby,
                rust: hljsRust,
                swift: hljsSwift,
                typescript: hljsTypeScript,
                csharp: hljsCSharp,
                dart: hljsDart,
                bash: hljsBash,
                xml: hljsXml,
                groovy: hljsGroovy,
            },
            detect: false,
            ignoreMissing: true,
            aliases: {
                javascript: ['jsx'],
                typescript: ['tsx'],
                xml: ['svelte', 'vue'],
                groovy: ['gradle'],
            },
        },
    ],
];

const StyledCodeBlock = styled('pre')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    fontSize: theme.typography.body2.fontSize,
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    maxHeight: theme.spacing(90),
    '.hljs': {
        background: 'transparent',
        padding: 0,
        color: theme.palette.text.primary,
    },
    '.hljs-keyword, .hljs-selector-tag': {
        color: theme.mode === 'dark' ? '#ff7b72' : '#d73a49',
    },
    '.hljs-string, .hljs-doctag, .hljs-template-variable': {
        color: theme.mode === 'dark' ? '#a5d6ff' : '#032f62',
    },
    '.hljs-number, .hljs-literal': {
        color: theme.mode === 'dark' ? '#79c0ff' : '#005cc5',
    },
    '.hljs-comment': {
        color: theme.mode === 'dark' ? '#8b949e' : '#6a737d',
        fontStyle: 'italic',
    },
    '.hljs-built_in': {
        color: theme.mode === 'dark' ? '#ffa657' : '#e36209',
    },
    '.hljs-title, .hljs-title.function_': {
        color: theme.mode === 'dark' ? '#d2a8ff' : '#6f42c1',
    },
    '.hljs-type, .hljs-attr': {
        color: theme.mode === 'dark' ? '#79c0ff' : '#005cc5',
    },
    '.hljs-variable': {
        color: theme.palette.text.primary,
    },
    '.hljs-name, .hljs-tag': {
        color: theme.mode === 'dark' ? '#7ee787' : '#22863a',
    },
    '.hljs-meta': {
        color: theme.palette.text.secondary,
    },
    '.hljs-emphasis': { fontStyle: 'italic' },
    '.hljs-strong': { fontWeight: 'bold' },
}));

const CopyToClipboard = styled(Tooltip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

type HastNode = { type: string; value?: string; children?: HastNode[] };

function hastToText(node: HastNode | null | undefined): string {
    if (!node) return '';
    if (node.type === 'text') return node.value ?? '';
    return (node.children ?? []).map(hastToText).join('');
}

const CopyBlock: FC<{
    title: string;
    code: string;
    className?: string;
    children: ReactNode;
}> = ({ title, code, className, children }) => {
    const { setToastData } = useToast();

    const onCopyToClipboard = (data: string) => () => {
        copy(data);
        setToastData({
            type: 'success',
            text: 'Copied to clipboard',
        });
    };

    return (
        <StyledCodeBlock>
            <code className={className}>{children}</code>
            <CopyToClipboard title={title} arrow>
                <IconButton onClick={onCopyToClipboard(code)} size='small'>
                    <CopyIcon />
                </IconButton>
            </CopyToClipboard>
        </StyledCodeBlock>
    );
};

export const CodeRenderer: FC<ComponentProps<'code'> & ExtraProps> = ({
    children,
    className,
    node,
}) => {
    // In react-markdown v9+, block code fences have a language class; inline code does not.
    const isCodeBlock = Boolean(className);
    if (isCodeBlock) {
        const code = hastToText(node);
        return (
            <CopyBlock code={code} title='Copy code' className={className}>
                {children}
            </CopyBlock>
        );
    }

    return <code className={className}>{children}</code>;
};
