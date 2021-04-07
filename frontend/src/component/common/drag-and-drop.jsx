import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React from 'react';

function useDNDProviderElement(props) {

    if (!props.children) return null;

    return <DndProvider backend={HTML5Backend}>{props.children}</DndProvider>;
}

export default function DragAndDrop(props) {
    const DNDElement = useDNDProviderElement(props);
    return <React.Fragment>{DNDElement}</React.Fragment>;
}
