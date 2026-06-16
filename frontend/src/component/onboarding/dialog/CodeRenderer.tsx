import { type FC, type ComponentProps, useRef, useEffect } from 'react';
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
import type { ExtraProps } from 'react-markdown';

import hljs from 'highlight.js/lib/core';
import hljsBash from 'highlight.js/lib/languages/bash';
import hljsCSharp from 'highlight.js/lib/languages/csharp';
import hljsDart from 'highlight.js/lib/languages/dart';
import hljsGo from 'highlight.js/lib/languages/go';
import hljsGroovy from 'highlight.js/lib/languages/groovy';
import hljsJava from 'highlight.js/lib/languages/java';
import hljsJavaScript from 'highlight.js/lib/languages/javascript';
import hljsKotlin from 'highlight.js/lib/languages/kotlin';
import hljsPhp from 'highlight.js/lib/languages/php';
import hljsPython from 'highlight.js/lib/languages/python';
import hljsRuby from 'highlight.js/lib/languages/ruby';
import hljsRust from 'highlight.js/lib/languages/rust';
import hljsSwift from 'highlight.js/lib/languages/swift';
import hljsTypeScript from 'highlight.js/lib/languages/typescript';
import hljsXml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', hljsBash);
hljs.registerLanguage('csharp', hljsCSharp);
hljs.registerLanguage('dart', hljsDart);
hljs.registerLanguage('go', hljsGo);
hljs.registerLanguage('groovy', hljsGroovy);
hljs.registerLanguage('java', hljsJava);
hljs.registerLanguage('javascript', hljsJavaScript);
hljs.registerLanguage('kotlin', hljsKotlin);
hljs.registerLanguage('php', hljsPhp);
hljs.registerLanguage('python', hljsPython);
hljs.registerLanguage('ruby', hljsRuby);
hljs.registerLanguage('rust', hljsRust);
hljs.registerLanguage('swift', hljsSwift);
hljs.registerLanguage('typescript', hljsTypeScript);
hljs.registerLanguage('xml', hljsXml);

const languageAliases: Record<string, string> = {
    gradle: 'groovy',
    js: 'javascript',
    jsx: 'javascript',
    rb: 'ruby',
    sh: 'bash',
    shell: 'bash',
    svelte: 'xml',
    ts: 'typescript',
    tsx: 'typescript',
    vue: 'xml',
};

function highlight(code: string, language: string): string | null {
    const resolved = languageAliases[language] ?? language;
    if (!hljs.getLanguage(resolved)) return null;
    return hljs.highlight(code, { language: resolved }).value;
}

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
        color: theme.palette.codeHighlighting.variable,
    },
    '.hljs-keyword': {
        color: theme.palette.codeHighlighting.keyword,
    },
    '.hljs-selector-tag': {
        color: theme.palette.codeHighlighting.selectorTag,
    },
    '.hljs-string, .hljs-doctag, .hljs-template-variable': {
        color: theme.palette.codeHighlighting.string,
    },
    '.hljs-number': {
        color: theme.palette.codeHighlighting.number,
    },
    '.hljs-literal': {
        color: theme.palette.codeHighlighting.literal,
    },
    '.hljs-comment': {
        color: theme.palette.codeHighlighting.comment,
        fontStyle: 'italic',
    },
    '.hljs-built_in': {
        color: theme.palette.codeHighlighting.builtIn,
    },
    '.hljs-title, .hljs-title.function_': {
        color: theme.palette.codeHighlighting.title,
    },
    '.hljs-title.class_': {
        color: theme.palette.codeHighlighting.class_,
    },
    '.hljs-type': {
        color: theme.palette.codeHighlighting.type,
    },
    '.hljs-attr': {
        color: theme.palette.codeHighlighting.attr,
    },
    '.hljs-variable': {
        color: theme.palette.codeHighlighting.variable,
    },
    '.hljs-name, .hljs-tag': {
        color: theme.palette.codeHighlighting.tag,
    },
    '.hljs-meta': {
        color: theme.palette.codeHighlighting.meta,
    },
    '.hljs-emphasis': { fontStyle: 'italic' },
    '.hljs-strong': { fontWeight: 'bold' },
}));

const CopyToClipboard = styled(Tooltip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const HighlightedCode: FC<{ language: string; html: string }> = ({
    language,
    html,
}) => {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.innerHTML = html;
    }, [html]);
    return <code ref={ref} className={`hljs language-${language}`} />;
};

const CopyBlock: FC<{ title: string; code: string; language: string }> = ({
    title,
    code,
    language,
}) => {
    const { setToastData } = useToast();

    const onCopyToClipboard = (data: string) => () => {
        copy(data);
        setToastData({
            type: 'success',
            text: 'Copied to clipboard',
        });
    };

    const highlightedHtml = highlight(code, language);

    return (
        <StyledCodeBlock>
            {highlightedHtml ? (
                <HighlightedCode language={language} html={highlightedHtml} />
            ) : (
                <code>{code}</code>
            )}
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
}) => {
    const isCodeBlock = Boolean(className);
    const code = Array.isArray(children) ? children[0] : children;
    if (isCodeBlock && typeof code === 'string') {
        const language = className?.replace('language-', '') ?? '';
        return <CopyBlock code={code} language={language} title='Copy code' />;
    }

    return <code className={className}>{children}</code>;
};
