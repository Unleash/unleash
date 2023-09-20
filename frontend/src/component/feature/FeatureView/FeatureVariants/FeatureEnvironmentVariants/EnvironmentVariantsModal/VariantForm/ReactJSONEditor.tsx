import { JSONEditorPropsOptional, JSONEditor, Mode } from 'vanilla-jsoneditor';
import { useEffect, useRef } from 'react';

const VanillaJSONEditor: React.FC<JSONEditorPropsOptional> = props => {
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

    return <div className="vanilla-jsoneditor-react" ref={refContainer}></div>;
};

const ReactJSONEditor: React.FC<JSONEditorPropsOptional> = props => {
    return (
        <VanillaJSONEditor
            mainMenuBar={false}
            navigationBar={false}
            mode={Mode.text}
            {...props}
        />
    );
};

export default ReactJSONEditor;
