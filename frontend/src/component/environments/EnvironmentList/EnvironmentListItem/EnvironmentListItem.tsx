import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    IconButton,
} from '@material-ui/core';
import {
    CloudCircle,
    Delete,
    DragIndicator,
    Edit,
    OfflineBolt,
} from '@material-ui/icons';
import ConditionallyRender from '../../../common/ConditionallyRender';

import { IEnvironment } from '../../../../interfaces/environments';
import React, { useContext, useRef } from 'react';
import AccessContext from '../../../../contexts/AccessContext';
import {
    DELETE_ENVIRONMENT,
    UPDATE_ENVIRONMENT,
} from '../../../providers/AccessProvider/permissions';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import DisabledIndicator from '../../../common/DisabledIndicator/DisabledIndicator';
import StringTruncator from '../../../common/StringTruncator/StringTruncator';
import { useHistory } from 'react-router-dom';

interface IEnvironmentListItemProps {
    env: IEnvironment;
    setSelectedEnv: React.Dispatch<React.SetStateAction<IEnvironment>>;
    setDeldialogue: React.Dispatch<React.SetStateAction<boolean>>;
    setToggleDialog: React.Dispatch<React.SetStateAction<boolean>>;
    index: number;
    moveListItem: (dragIndex: number, hoverIndex: number) => IEnvironment[];
    moveListItemApi: (dragIndex: number, hoverIndex: number) => Promise<void>;
}

interface DragItem {
    index: number;
    id: string;
    type: string;
}

const EnvironmentListItem = ({
    env,
    setSelectedEnv,
    setDeldialogue,
    index,
    moveListItem,
    moveListItemApi,
    setToggleDialog,
}: IEnvironmentListItemProps) => {
    const history = useHistory();
    const ref = useRef<HTMLDivElement>(null);
    const ACCEPT_TYPE = 'LIST_ITEM';
    const [{ isDragging }, drag] = useDrag({
        type: ACCEPT_TYPE,
        item: () => {
            return { env, index };
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ handlerId }, drop] = useDrop({
        accept: ACCEPT_TYPE,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        drop(item: DragItem, monitor: DropTargetMonitor) {
            const dragIndex = item.index;
            const hoverIndex = index;
            moveListItemApi(dragIndex, hoverIndex);
        },
        hover(item: DragItem, monitor: DropTargetMonitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return;
            }

            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            const clientOffset = monitor.getClientOffset();

            const hoverClientY =
                (clientOffset as XYCoord).y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            moveListItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const opacity = isDragging ? 0 : 1;

    const { hasAccess } = useContext(AccessContext);
    const updatePermission = hasAccess(UPDATE_ENVIRONMENT);
    const tooltipText = env.enabled ? 'Disable' : 'Enable';

    if (updatePermission) {
        drag(drop(ref));
    }

    return (
        <ListItem
            style={{ position: 'relative', opacity }}
            ref={ref}
            data-handler-id={handlerId}
        >
            <ListItemIcon>
                <CloudCircle />
            </ListItemIcon>
            <ListItemText
                primary={
                    <>
                        <strong>
                            <StringTruncator text={env.name} maxWidth={'125'} />
                        </strong>
                        <ConditionallyRender
                            condition={!env.enabled}
                            show={<DisabledIndicator />}
                        />
                    </>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title="Drag to reorder">
                        <IconButton>
                            <DragIndicator />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title={`${tooltipText} environment`}>
                        <IconButton
                            aria-label="disable"
                            disabled={env.protected}
                            onClick={() => {
                                setSelectedEnv(env);
                                setToggleDialog(prev => !prev);
                            }}
                        >
                            <OfflineBolt />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title="Update environment">
                        <IconButton
                            aria-label="update"
                            disabled={env.protected}
                            onClick={() => {
                                history.push(`/environments/${env.name}`);
                            }}
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={hasAccess(DELETE_ENVIRONMENT)}
                show={
                    <Tooltip title="Delete environment">
                        <IconButton
                            aria-label="delete"
                            disabled={env.protected}
                            onClick={() => {
                                setDeldialogue(true);
                                setSelectedEnv(env);
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                }
            />
        </ListItem>
    );
};

export default EnvironmentListItem;
