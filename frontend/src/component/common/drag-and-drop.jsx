import { DndProvider, createDndContext } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useRef } from 'react';

const RNDContext = createDndContext(HTML5Backend);

function useDNDProviderElement(props) {
    const manager = useRef(RNDContext);

    if (!props.children) return null;

    return <DndProvider manager={manager.current.dragDropManager}>{props.children}</DndProvider>;
}

export default function DragAndDrop(props) {
    const DNDElement = useDNDProviderElement(props);
    return <React.Fragment>{DNDElement}</React.Fragment>;
}
