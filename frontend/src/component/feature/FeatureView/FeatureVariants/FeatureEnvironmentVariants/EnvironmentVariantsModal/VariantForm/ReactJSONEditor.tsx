import { JSONEditorPropsOptional, JSONEditor, Mode } from 'vanilla-jsoneditor';
import { useContext, useEffect, useRef } from 'react';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { styled } from '@mui/material';
import UIContext from 'contexts/UIContext';

const JSONEditorThemeWrapper = styled('div')(({ theme }) => ({
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
}));

const VanillaJSONEditor: React.FC<JSONEditorPropsOptional> = (props) => {
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

const ReactJSONEditor: React.FC<JSONEditorPropsOptional> = (props) => {
    const { themeMode } = useContext(UIContext);
    return (
        <JSONEditorThemeWrapper
            className={themeMode === 'dark' ? 'jse-theme-dark' : ''}
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
