import type { CodeComponent } from 'react-markdown/lib/ast-to-react';
import type { FC } from 'react';
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
    maxHeight: theme.spacing(34),
}));

const CopyToClipboard = styled(Tooltip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const CopyBlock: FC<{ title: string; code: string }> = ({ title, code }) => {
    const onCopyToClipboard = (data: string) => () => {
        copy(data);
        setToastData({
            type: 'success',
            text: 'Copied to clipboard',
        });
    };
    const { setToastData } = useToast();

    return (
        <StyledCodeBlock>
            {code}
            <CopyToClipboard title={title} arrow>
                <IconButton onClick={onCopyToClipboard(code)} size='small'>
                    <CopyIcon />
                </IconButton>
            </CopyToClipboard>
        </StyledCodeBlock>
    );
};

export const CodeRenderer: CodeComponent = ({ inline = false, children }) => {
    if (!inline && typeof children?.[0] === 'string') {
        return <CopyBlock code={children[0]} title='Copy code' />;
    }

    return <code>{children}</code>;
};
