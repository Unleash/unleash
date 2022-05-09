import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    CloudCircle,
    Delete,
    DragIndicator,
    Edit,
    OfflineBolt,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { IEnvironment } from 'interfaces/environments';
import React, { useContext, useRef } from 'react';
import AccessContext from 'contexts/AccessContext';
import {
    DELETE_ENVIRONMENT,
    UPDATE_ENVIRONMENT,
} from 'component/providers/AccessProvider/permissions';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord, Identifier } from 'dnd-core';
import DisabledIndicator from 'component/common/DisabledIndicator/DisabledIndicator';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { useNavigate } from 'react-router-dom';

interface IEnvironmentListItemProps {
    env: IEnvironment;
    setSelectedEnv: React.Dispatch<React.SetStateAction<IEnvironment>>;
    setDeldialogue: React.Dispatch<React.SetStateAction<boolean>>;
    setToggleDialog: React.Dispatch<React.SetStateAction<boolean>>;
    index: number;
    moveListItem: (dragIndex: number, hoverIndex: number) => IEnvironment[];
    moveListItemApi: (dragIndex: number, hoverIndex: number) => Promise<void>;
}

interface IDragItem {
    index: number;
    id: string;
    type: string;
}

interface ICollectedProps {
    handlerId: Identifier | null;
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
    const navigate = useNavigate();
    const ref = useRef<HTMLLIElement>(null);
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

    const [{ handlerId }, drop] = useDrop<IDragItem, unknown, ICollectedProps>({
        accept: ACCEPT_TYPE,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        drop(item: IDragItem, monitor: DropTargetMonitor) {
            const dragIndex = item.index;
            const hoverIndex = index;
            moveListItemApi(dragIndex, hoverIndex);
        },
        hover(item: IDragItem, monitor: DropTargetMonitor) {
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
                    <IconButton size="large">
                        <DragIndicator titleAccess="Drag" cursor="grab" />
                    </IconButton>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title={`${tooltipText} environment`} arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedEnv(env);
                                setToggleDialog(prev => !prev);
                            }}
                            size="large"
                        >
                            <OfflineBolt />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title="Edit environment" arrow>
                        <IconButton
                            disabled={env.protected}
                            onClick={() => {
                                navigate(`/environments/${env.name}`);
                            }}
                            size="large"
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={hasAccess(DELETE_ENVIRONMENT)}
                show={
                    <Tooltip title="Delete environment" arrow>
                        <IconButton
                            disabled={env.protected}
                            onClick={() => {
                                setDeldialogue(true);
                                setSelectedEnv(env);
                            }}
                            size="large"
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
