import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import ErrorIcon from '@mui/icons-material/Error';
import FormatIndentIncrease from '@mui/icons-material/FormatIndentIncrease';
import { Box, Button, styled, useTheme } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

type EditorStyle = 'default' | 'sidePanel';

type JSONContent = { text: string } | { json: unknown };

type JSONEditorChange = (content: JSONContent) => void;

interface IReactJSONEditorProps {
    content: JSONContent;
    onChange?: JSONEditorChange;
    onBlur?: () => void;
    validationError?: string;
    readOnly?: boolean;
    statusBar?: boolean;
    editorStyle?: EditorStyle;
}

const StyledEditorWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'editorStyle' && prop !== 'hasError',
})<{ editorStyle: EditorStyle; hasError: boolean }>(
    ({ theme, editorStyle, hasError }) => ({
        border: `1px solid ${
            hasError ? theme.palette.error.main : theme.palette.divider
        }`,
        borderRadius: theme.shape.borderRadiusMedium,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        minHeight: editorStyle === 'sidePanel' ? undefined : theme.spacing(8),
        '&:hover': {
            borderColor: theme.palette.action.disabled,
        },
        '& .cm-cursor': {
            borderLeftWidth: theme.spacing(0.2),
            borderLeftColor: theme.palette.text.primary,
        },
        '&:focus-within': {
            borderColor: hasError
                ? theme.palette.error.main
                : theme.palette.primary.main,
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
            backgroundColor: theme.palette.background.alternative,
            borderRight: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.secondary,
            minHeight: 'inherit',
        },
        '& .cm-lineNumbers .cm-gutterElement': {
            paddingLeft: theme.spacing(0.75),
            paddingRight: theme.spacing(0.75),
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
        '& .cm-lintRange-error': {
            backgroundImage: `linear-gradient(45deg, transparent 65%, ${theme.palette.error.main} 80%, transparent 90%),
            linear-gradient(135deg, transparent 5%, ${theme.palette.error.main} 15%, transparent 25%),
            linear-gradient(135deg, transparent 45%, ${theme.palette.error.main} 55%, transparent 65%),
            linear-gradient(45deg, transparent 25%, ${theme.palette.error.main} 35%, transparent 50%)`,
            backgroundPosition: '0 100%',
            backgroundRepeat: 'repeat-x',
            backgroundSize: '8px 3px',
        },
        '& .cm-diagnostic-error': {
            borderLeftColor: theme.palette.error.main,
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
    }),
);

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

const StyledValidationMessage = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.75),
    padding: theme.spacing(1, 1.5),
    border: `1px solid ${theme.palette.error.border}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
    fontSize: theme.fontSizes.smallBody,
    lineHeight: 1.4,
}));

const StyledEditorContainer = styled('div')({
    width: '100%',
});

const contentToText = (content: JSONContent): string => {
    if ('text' in content) {
        return content.text;
    }

    return JSON.stringify(content.json, undefined, 2) ?? '';
};

const getJsonValidationError = (value: string): string | undefined => {
    if (value.trim() === '') {
        return undefined;
    }

    try {
        JSON.parse(value);
        return undefined;
    } catch (error) {
        if (error instanceof Error) {
            return error.message;
        }

        return 'Invalid JSON';
    }
};

const ReactJSONEditor: FC<IReactJSONEditorProps> = ({
    content,
    onChange,
    onBlur,
    validationError: validationErrorProp,
    readOnly = false,
    statusBar = false,
    editorStyle = 'default',
}) => {
    const theme = useTheme();
    const value = useMemo(() => contentToText(content), [content]);
    const [validationError, setValidationError] = useState<string>();
    const extensions = useMemo(
        () => [json(), ...(readOnly ? [] : [linter(jsonParseLinter())])],
        [readOnly],
    );
    const shouldValidateInternally =
        !readOnly && validationErrorProp === undefined;

    useEffect(() => {
        setValidationError(
            shouldValidateInternally
                ? getJsonValidationError(value)
                : undefined,
        );
    }, [shouldValidateInternally, value]);

    const handleChange = useCallback(
        (value: string) => {
            if (shouldValidateInternally) {
                setValidationError(getJsonValidationError(value));
            }
            onChange?.({ text: value });
        },
        [onChange, shouldValidateInternally],
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
    const visibleValidationError = validationErrorProp ?? validationError;

    return (
        <StyledEditorContainer>
            <StyledEditorWrapper
                editorStyle={editorStyle}
                hasError={Boolean(visibleValidationError)}
            >
                {!readOnly ? (
                    <StyledFormatButton
                        size='medium'
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
                    extensions={extensions}
                    onChange={handleChange}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    editable={!readOnly}
                    basicSetup={{
                        foldGutter: false,
                        lineNumbers: false,
                        highlightActiveLine: false,
                        highlightActiveLineGutter: false,
                    }}
                />
                {statusBar ? <StyledStatusBar>JSON</StyledStatusBar> : null}
            </StyledEditorWrapper>
            {visibleValidationError ? (
                <StyledValidationMessage role='alert'>
                    <ErrorIcon fontSize='small' />
                    {visibleValidationError}
                </StyledValidationMessage>
            ) : null}
        </StyledEditorContainer>
    );
};

export default ReactJSONEditor;
