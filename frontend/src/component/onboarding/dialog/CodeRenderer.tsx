import type { FC, ComponentProps } from 'react';
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

import CodeMirror from '@uiw/react-codemirror';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { python as pythonLang } from '@codemirror/lang-python';
import { java as javaLang } from '@codemirror/lang-java';
import { rust as rustLang } from '@codemirror/lang-rust';
import { xml } from '@codemirror/lang-xml';
import { php as phpLang } from '@codemirror/lang-php';
import { json } from '@codemirror/lang-json';
import { StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import { classHighlighter } from '@lezer/highlight';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { go as goMode } from '@codemirror/legacy-modes/mode/go';
import { csharp, kotlin, dart } from '@codemirror/legacy-modes/mode/clike';
import { groovy } from '@codemirror/legacy-modes/mode/groovy';
import { ruby as rubyMode } from '@codemirror/legacy-modes/mode/ruby';
import { swift as swiftMode } from '@codemirror/legacy-modes/mode/swift';

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

function getLanguageExtension(language: string) {
    const resolved = languageAliases[language] ?? language;
    switch (resolved) {
        case 'javascript':
            return jsLang();
        case 'typescript':
            return jsLang({ typescript: true });
        case 'python':
            return pythonLang();
        case 'java':
            return javaLang();
        case 'rust':
            return rustLang();
        case 'php':
            return phpLang();
        case 'json':
            return json();
        case 'xml':
            return xml();
        case 'bash':
            return StreamLanguage.define(shell);
        case 'go':
            return StreamLanguage.define(goMode);
        case 'csharp':
            return StreamLanguage.define(csharp);
        case 'dart':
            return StreamLanguage.define(dart);
        case 'groovy':
            return StreamLanguage.define(groovy);
        case 'kotlin':
            return StreamLanguage.define(kotlin);
        case 'ruby':
            return StreamLanguage.define(rubyMode);
        case 'swift':
            return StreamLanguage.define(swiftMode);
        default:
            return null;
    }
}

const BASE_EXTENSIONS = [syntaxHighlighting(classHighlighter)];

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

const StyledCodeBlock = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    maxHeight: theme.spacing(90),
    position: 'relative',
    '& .cm-editor': {
        backgroundColor: 'transparent',
        color: theme.palette.codeHighlighting.variable,
        outline: 0,
    },
    '& .cm-scroller': {
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.body2.fontSize,
        overflow: 'visible',
    },
    '& .cm-content': {
        padding: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    },
    '& .cm-line': {
        padding: 0,
    },
    '& .tok-keyword': { color: theme.palette.codeHighlighting.keyword },
    '& .tok-string, & .tok-string2': {
        color: theme.palette.codeHighlighting.string,
    },
    '& .tok-number': { color: theme.palette.codeHighlighting.number },
    '& .tok-bool, & .tok-null': {
        color: theme.palette.codeHighlighting.literal,
    },
    '& .tok-comment': {
        color: theme.palette.codeHighlighting.comment,
        fontStyle: 'italic',
    },
    '& .tok-builtin': { color: theme.palette.codeHighlighting.builtIn },
    '& .tok-typeName': { color: theme.palette.codeHighlighting.type },
    '& .tok-className': { color: theme.palette.codeHighlighting.class_ },
    '& .tok-propertyName, & .tok-attributeName': {
        color: theme.palette.codeHighlighting.attr,
    },
    '& .tok-variableName': { color: theme.palette.codeHighlighting.variable },
    '& .tok-tagName': { color: theme.palette.codeHighlighting.tag },
    '& .tok-meta': { color: theme.palette.codeHighlighting.meta },
    '& .tok-emphasis': { fontStyle: 'italic' },
    '& .tok-strong': { fontWeight: 'bold' },
}));

const CopyToClipboard = styled(Tooltip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

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

    const langExtension = getLanguageExtension(language);
    const extensions = langExtension
        ? [...BASE_EXTENSIONS, langExtension]
        : BASE_EXTENSIONS;

    return (
        <StyledCodeBlock>
            <CodeMirror
                value={code}
                theme='none'
                extensions={extensions}
                readOnly={true}
                editable={false}
                basicSetup={{
                    foldGutter: false,
                    lineNumbers: false,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                }}
            />
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
