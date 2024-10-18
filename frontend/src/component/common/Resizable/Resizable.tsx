import { styled } from '@mui/material';
import { type HTMLAttributes, useRef, useState, type ReactNode } from 'react';

const StyledResizableWrapper = styled('div', {
    shouldForwardProp: (prop) => prop !== 'animate',
})<{ animate: boolean }>(({ animate }) => ({
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    transition: animate ? 'width 0.3s, height 0.3s' : 'none',
}));

const StyledResizeHandle = styled('div')({
    position: 'absolute',
    background: 'transparent',
    zIndex: 1,
    '&.top-left': {
        top: 0,
        left: 0,
        cursor: 'nwse-resize',
        width: '10px',
        height: '10px',
        zIndex: 2,
    },
    '&.top-right': {
        top: 0,
        right: 0,
        cursor: 'nesw-resize',
        width: '10px',
        height: '10px',
        zIndex: 2,
    },
    '&.bottom-left': {
        bottom: 0,
        left: 0,
        cursor: 'nesw-resize',
        width: '10px',
        height: '10px',
        zIndex: 2,
    },
    '&.bottom-right': {
        bottom: 0,
        right: 0,
        cursor: 'nwse-resize',
        width: '10px',
        height: '10px',
        zIndex: 2,
    },
    '&.top': {
        top: 0,
        left: '50%',
        cursor: 'ns-resize',
        width: '100%',
        height: '5px',
        transform: 'translateX(-50%)',
    },
    '&.right': {
        top: '50%',
        right: 0,
        cursor: 'ew-resize',
        width: '5px',
        height: '100%',
        transform: 'translateY(-50%)',
    },
    '&.bottom': {
        bottom: 0,
        left: '50%',
        cursor: 'ns-resize',
        width: '100%',
        height: '5px',
        transform: 'translateX(-50%)',
    },
    '&.left': {
        top: '50%',
        left: 0,
        cursor: 'ew-resize',
        width: '5px',
        height: '100%',
        transform: 'translateY(-50%)',
    },
});

type Handler =
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

type Size = { width: string; height: string };

interface IResizableProps extends HTMLAttributes<HTMLDivElement> {
    handlers: Handler[];
    minSize: Size;
    maxSize: Size;
    defaultSize?: Size;
    onResize?: () => void;
    onResizeEnd?: () => void;
    children: ReactNode;
}

export const Resizable = ({
    handlers,
    minSize,
    maxSize,
    defaultSize = minSize,
    onResize,
    onResizeEnd,
    children,
    ...props
}: IResizableProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [currentSize, setCurrentSize] = useState(defaultSize);
    const [animate, setAnimate] = useState(false);

    const handleResize = (
        e: React.MouseEvent<HTMLDivElement>,
        direction:
            | 'top'
            | 'right'
            | 'bottom'
            | 'left'
            | 'top-left'
            | 'top-right'
            | 'bottom-left'
            | 'bottom-right',
    ) => {
        e.preventDefault();

        const chatContainer = containerRef.current;
        if (!chatContainer) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = chatContainer.offsetWidth;
        const startHeight = chatContainer.offsetHeight;

        setAnimate(false);

        const onMouseMove = (moveEvent: MouseEvent) => {
            let newWidth = startWidth;
            let newHeight = startHeight;

            if (direction.includes('top')) {
                newHeight = Math.max(
                    Number.parseInt(minSize.height),
                    startHeight - (moveEvent.clientY - startY),
                );
            }

            if (direction.includes('bottom')) {
                newHeight = Math.max(
                    Number.parseInt(minSize.height),
                    startHeight + (moveEvent.clientY - startY),
                );
            }

            if (direction.includes('left')) {
                newWidth = Math.max(
                    Number.parseInt(minSize.width),
                    startWidth - (moveEvent.clientX - startX),
                );
            }

            if (direction.includes('right')) {
                newWidth = Math.max(
                    Number.parseInt(minSize.width),
                    startWidth + (moveEvent.clientX - startX),
                );
            }

            setCurrentSize({
                width: `${newWidth}px`,
                height: `${newHeight}px`,
            });

            onResize?.();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            onResizeEnd?.();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleDoubleClick = (direction: Handler) => {
        const chatContainer = containerRef.current;
        if (!chatContainer) return;

        const currentWidth = chatContainer.style.width;
        const currentHeight = chatContainer.style.height;

        setAnimate(true);

        if (direction.includes('top') || direction.includes('bottom')) {
            if (currentHeight === maxSize.height) {
                chatContainer.style.height = defaultSize.height;
            } else {
                chatContainer.style.height = maxSize.height;
            }
        }

        if (direction.includes('left') || direction.includes('right')) {
            if (currentWidth === maxSize.width) {
                chatContainer.style.width = defaultSize.width;
            } else {
                chatContainer.style.width = maxSize.width;
            }
        }

        onResizeEnd?.();
    };

    return (
        <StyledResizableWrapper
            ref={containerRef}
            animate={animate}
            {...props}
            style={{
                width: currentSize.width,
                height: currentSize.height,
                minWidth: minSize.width,
                minHeight: minSize.height,
                maxWidth: maxSize.width,
                maxHeight: maxSize.height,
            }}
        >
            {children}

            {handlers.includes('top-left') && (
                <StyledResizeHandle
                    className='top-left'
                    onMouseDown={(e) => handleResize(e, 'top-left')}
                    onDoubleClick={() => handleDoubleClick('top-left')}
                />
            )}
            {handlers.includes('top-right') && (
                <StyledResizeHandle
                    className='top-right'
                    onMouseDown={(e) => handleResize(e, 'top-right')}
                    onDoubleClick={() => handleDoubleClick('top-right')}
                />
            )}
            {handlers.includes('bottom-left') && (
                <StyledResizeHandle
                    className='bottom-left'
                    onMouseDown={(e) => handleResize(e, 'bottom-left')}
                    onDoubleClick={() => handleDoubleClick('bottom-left')}
                />
            )}
            {handlers.includes('bottom-right') && (
                <StyledResizeHandle
                    className='bottom-right'
                    onMouseDown={(e) => handleResize(e, 'bottom-right')}
                    onDoubleClick={() => handleDoubleClick('bottom-right')}
                />
            )}
            {handlers.includes('top') && (
                <StyledResizeHandle
                    className='top'
                    onMouseDown={(e) => handleResize(e, 'top')}
                    onDoubleClick={() => handleDoubleClick('top')}
                />
            )}
            {handlers.includes('right') && (
                <StyledResizeHandle
                    className='right'
                    onMouseDown={(e) => handleResize(e, 'right')}
                    onDoubleClick={() => handleDoubleClick('right')}
                />
            )}
            {handlers.includes('bottom') && (
                <StyledResizeHandle
                    className='bottom'
                    onMouseDown={(e) => handleResize(e, 'bottom')}
                    onDoubleClick={() => handleDoubleClick('bottom')}
                />
            )}
            {handlers.includes('left') && (
                <StyledResizeHandle
                    className='left'
                    onMouseDown={(e) => handleResize(e, 'left')}
                    onDoubleClick={() => handleDoubleClick('left')}
                />
            )}
        </StyledResizableWrapper>
    );
};
