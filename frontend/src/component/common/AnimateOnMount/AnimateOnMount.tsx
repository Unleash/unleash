import React, { useEffect, useState, useRef, FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IAnimateOnMountProps {
    mounted: boolean;
    enter: string;
    start: string;
    leave?: string;
    container?: string;
    style?: React.CSSProperties;
    onStart?: () => void;
    onEnd?: () => void;
}

const AnimateOnMount: FC<IAnimateOnMountProps> = ({
    mounted,
    enter,
    start,
    leave,
    container,
    children,
    style,
    onStart,
    onEnd,
}) => {
    const [show, setShow] = useState(mounted);
    const [styles, setStyles] = useState('');
    const mountedRef = useRef<null | boolean>(null);

    useEffect(() => {
        if (mountedRef.current !== mounted || mountedRef === null) {
            if (mounted) {
                setShow(true);
                onStart?.();
                setTimeout(() => {
                    setStyles(enter);
                }, 50);
            } else {
                if (!leave) {
                    setShow(false);
                }
                setStyles(leave || '');
            }
        }
    }, [mounted, enter, onStart, leave]);

    const onTransitionEnd = () => {
        if (!mounted) {
            setShow(false);
            onEnd?.();
        }
    };

    return (
        <ConditionallyRender
            condition={show}
            show={
                <div
                    className={`${start} ${styles} ${
                        container ? container : ''
                    }`}
                    onTransitionEnd={onTransitionEnd}
                    style={{ ...style }}
                >
                    {children}
                </div>
            }
        />
    );
};

export default AnimateOnMount;
