import { json } from '@codemirror/lang-json';
import FormatIndentIncrease from '@mui/icons-material/FormatIndentIncrease';
import { Box, Button, styled, useTheme } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { type FC, useCallback, useMemo } from 'react';

type EditorStyle = 'default' | 'sidePanel';

type JSONContent = { text: string } | { json: unknown };

type JSONEditorChange = (content: JSONContent) => void;

interface IReactJSONEditorProps {
    content: JSONContent;
    onChange?: JSONEditorChange;
    onBlur?: () => void;
    readOnly?: boolean;
    statusBar?: boolean;
    editorStyle?: EditorStyle;
}

const StyledEditorWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'editorStyle',
})<{ editorStyle: EditorStyle }>(({ theme, editorStyle }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    minHeight: editorStyle === 'sidePanel' ? undefined : theme.spacing(8),
    ...(editorStyle !== 'sidePanel' && {
        '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: theme.spacing(2.75),
            backgroundColor: theme.palette.primary.main,
            pointerEvents: 'none',
            zIndex: 1,
        },
    }),
    '&:hover': {
        borderColor: theme.palette.action.disabled,
    },
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
    },
    '& .cm-editor': {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        fontSize: theme.fontSizes.smallBody,
        minHeight: 'inherit',
        outline: 0,
        position: 'relative',
        zIndex: 0,
    },
    '& .cm-focused': {
        outline: 0,
    },
    '& .cm-content': {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(12),
        paddingBottom: theme.spacing(1),
        minHeight: 'inherit',
    },
    '& .cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: 0,
        color: theme.palette.primary.contrastText,
        minHeight: 'inherit',
        position: 'relative',
        zIndex: 2,
    },
    '& .cm-lineNumbers .cm-gutterElement': {
        paddingLeft: 0,
        paddingRight: 0,
        textAlign: 'center',
    },
    '& .cm-gutter': {
        minHeight: 'inherit',
    },
    '& .cm-line': {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    '& .cm-scroller': {
        fontFamily: theme.typography.fontFamily,
        minHeight: 'inherit',
    },
    '& .cm-activeLine, & .cm-activeLineGutter': {
        backgroundColor: 'transparent',
    },
    '& .cm-selectionBackground, & .cm-content ::selection': {
        backgroundColor: `${theme.palette.primary.light} !important`,
    },
    '& .cm-tooltip': {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadiusMedium,
        boxShadow: theme.shadows[3],
    },
    ...(editorStyle === 'sidePanel' && {
        height: '100%',
        border: 0,
        backgroundColor: 'transparent',
        '&:hover, &:focus-within': {
            borderColor: 'transparent',
        },
        '& .cm-editor': {
            height: '100%',
            backgroundColor: 'transparent',
        },
        '& .cm-gutters': {
            backgroundColor: 'transparent',
            color: theme.palette.text.secondary,
        },
    }),
}));

const StyledFormatButton = styled(Button)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(0.75),
    right: theme.spacing(0.75),
    zIndex: 1,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
        backgroundColor: theme.palette.background.elevation1,
    },
}));

const StyledStatusBar = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5, 1),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.alternative,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const contentToText = (content: JSONContent): string => {
    if ('text' in content) {
        return content.text;
    }

    return JSON.stringify(content.json, undefined, 2) ?? '';
};

const ReactJSONEditor: FC<IReactJSONEditorProps> = ({
    content,
    onChange,
    onBlur,
    readOnly = false,
    statusBar = false,
    editorStyle = 'default',
}) => {
    const theme = useTheme();
    const value = useMemo(() => contentToText(content), [content]);

    const handleChange = useCallback(
        (value: string) => {
            onChange?.({ text: value });
        },
        [onChange],
    );

    const formatJson = useCallback(() => {
        let formatted: string;

        try {
            formatted = JSON.stringify(JSON.parse(value), undefined, 2);
        } catch {
            return;
        }

        onChange?.({ text: formatted });
    }, [onChange, value]);

    const minHeight =
        editorStyle === 'sidePanel' ? undefined : theme.spacing(10);

    return (
        <StyledEditorWrapper editorStyle={editorStyle}>
            {!readOnly ? (
                <StyledFormatButton
                    size='small'
                    variant='outlined'
                    startIcon={<FormatIndentIncrease />}
                    onClick={formatJson}
                >
                    Format
                </StyledFormatButton>
            ) : null}
            <CodeMirror
                value={value}
                minHeight={minHeight}
                height={editorStyle === 'sidePanel' ? '100%' : undefined}
                theme='none'
                extensions={[json()]}
                onChange={handleChange}
                onBlur={onBlur}
                readOnly={readOnly}
                editable={!readOnly}
                basicSetup={{
                    foldGutter: readOnly,
                    lineNumbers: true,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                }}
            />
            {statusBar ? <StyledStatusBar>JSON</StyledStatusBar> : null}
        </StyledEditorWrapper>
    );
};

export default ReactJSONEditor;
