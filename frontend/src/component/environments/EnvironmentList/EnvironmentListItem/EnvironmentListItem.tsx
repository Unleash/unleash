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
import ConditionallyRender from 'component/common/ConditionallyRender';

import { IEnvironment } from 'interfaces/environments';
import React, { useContext, useRef } from 'react';
import AccessContext from 'contexts/AccessContext';
import {
    DELETE_ENVIRONMENT,
    UPDATE_ENVIRONMENT,
} from 'component/providers/AccessProvider/permissions';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import DisabledIndicator from 'component/common/DisabledIndicator/DisabledIndicator';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
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
        // @ts-expect-error
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
                            <StringTruncator
                                text={env.name}
                                maxWidth={'125'}
                                maxLength={25}
                            />
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
                        <div>
                            <IconButton>
                                <DragIndicator titleAccess="Drag" />
                            </IconButton>
                        </div>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title={`${tooltipText} environment`}>
                        <div>
                            <IconButton
                                onClick={() => {
                                    setSelectedEnv(env);
                                    setToggleDialog(prev => !prev);
                                }}
                            >
                                <OfflineBolt titleAccess="Toggle" />
                            </IconButton>
                        </div>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title="Update environment">
                        <div>
                            <IconButton
                                disabled={env.protected}
                                onClick={() => {
                                    history.push(`/environments/${env.name}`);
                                }}
                            >
                                <Edit titleAccess="Edit" />
                            </IconButton>
                        </div>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={hasAccess(DELETE_ENVIRONMENT)}
                show={
                    <Tooltip title="Delete environment">
                        <div>
                            <IconButton
                                disabled={env.protected}
                                onClick={() => {
                                    setDeldialogue(true);
                                    setSelectedEnv(env);
                                }}
                            >
                                <Delete titleAccess="Delete" />
                            </IconButton>
                        </div>
                    </Tooltip>
                }
            />
        </ListItem>
    );
};

export default EnvironmentListItem;
