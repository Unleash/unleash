import {
    type JSONEditorPropsOptional,
    JSONEditor,
    Mode,
} from 'vanilla-jsoneditor';
import { useContext, useEffect, useRef } from 'react';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { styled } from '@mui/material';
import UIContext from 'contexts/UIContext';

type EditorStyle = 'default' | 'sidePanel';

const JSONEditorThemeWrapper = styled('div', {
    shouldForwardProp: (prop) => prop !== 'editorStyle',
})<{ editorStyle?: EditorStyle }>(({ theme, editorStyle = 'default' }) => ({
    '&.jse-theme-dark': {
        '--jse-background-color': theme.palette.background.default,
        '--jse-panel-background': theme.palette.background.default,
        '--jse-main-border': `1px solid #646382`,
    },
    '&:hover': {
        '--jse-main-border': `1px solid #8B8BA7`,
    },
    '& .jse-focus': {
        '--jse-main-border': `1px solid ${theme.palette.primary.main}`,
    },
    '& .jse-text-mode, .jse-contents': {
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius,
    },
    '& .jse-status-bar': {
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    },
    ...(editorStyle === 'sidePanel' && {
        '&&&': {
            '& .jse-main': {
                minHeight: 0,
            },
            '--jse-main-border': 0,
            '& > div': {
                height: '100%',
            },
            '& .jse-focus': {
                '--jse-main-border': 0,
            },
            '& .cm-gutters': {
                '--jse-panel-background': 'transparent',
                '--jse-panel-border': 'transparent',
            },
            '& .cm-gutter-lint': {
                width: 0,
            },
            '& .jse-text-mode': {
                borderBottomRightRadius: theme.shape.borderRadiusMedium,
            },
            '& .cm-scroller': {
                '--jse-delimiter-color': theme.palette.text.primary,
            },
        },
    }),
}));

interface IReactJSONEditorProps extends JSONEditorPropsOptional {
    editorStyle?: EditorStyle;
}

const VanillaJSONEditor: React.FC<IReactJSONEditorProps> = (props) => {
    const refContainer = useRef<HTMLDivElement | null>(null);
    const refEditor = useRef<JSONEditor | null>(null);

    useEffect(() => {
        // create editor
        if (refContainer.current !== null) {
            refEditor.current = new JSONEditor({
                target: refContainer.current,
                props: {},
            });
        }

        return () => {
            // destroy editor
            if (refEditor.current) {
                refEditor.current.destroy();
                refEditor.current = null;
            }
        };
    }, []);

    // update props
    useEffect(() => {
        if (refEditor.current) {
            refEditor.current.updateProps(props);
        }
    }, [props]);

    return <div ref={refContainer} />;
};

const ReactJSONEditor: React.FC<IReactJSONEditorProps> = (props) => {
    const { themeMode } = useContext(UIContext);
    return (
        <JSONEditorThemeWrapper
            className={themeMode === 'dark' ? 'jse-theme-dark' : ''}
            editorStyle={props.editorStyle}
        >
            <VanillaJSONEditor
                mainMenuBar={false}
                navigationBar={false}
                mode={Mode.text}
                {...props}
            />
        </JSONEditorThemeWrapper>
    );
};

export default ReactJSONEditor;
