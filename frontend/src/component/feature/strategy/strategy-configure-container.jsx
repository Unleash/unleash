import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';

import StrategyConfigure from './strategy-configure-component';

const dragSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index,
        };
    },
    endDrag(props, monitor) {
        if (!monitor.didDrop()) {
            return;
        }
        const result = monitor.getDropResult();
        if (typeof result.index === 'number' && props.index !== result.index) {
            props.moveStrategy(props.index, result.index);
        }
    },
};

const dragTarget = {
    drop(props) {
        return {
            index: props.index,
        };
    },
};

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

function collectTarget(connect, monitor) {
    return {
        highlighted: monitor.canDrop(),
        hovered: monitor.isOver(),
        connectDropTarget: connect.dropTarget(),
    };
}

const type = 'strategy';
export default flow(
    // eslint-disable-next-line new-cap
    DragSource(type, dragSource, collect),
    // eslint-disable-next-line new-cap
    DropTarget(type, dragTarget, collectTarget)
)(StrategyConfigure);
