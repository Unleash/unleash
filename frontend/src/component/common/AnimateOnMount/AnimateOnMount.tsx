import React, { CSSProperties, useEffect, useState, useRef, FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IAnimateOnMountProps {
    mounted: boolean;
    enter: CSSProperties;
    start: CSSProperties;
    leave?: CSSProperties;
    onStart?: () => void;
    onEnd?: () => void;
}

const AnimateOnMount: FC<IAnimateOnMountProps> = ({
    mounted,
    enter,
    start,
    leave,
    children,
    onStart,
    onEnd,
}) => {
    const [show, setShow] = useState(mounted);
    const [styles, setStyles] = useState<CSSProperties>({});
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
                setStyles(leave || {});
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
                    onTransitionEnd={onTransitionEnd}
                    style={{ ...start, ...styles }}
                >
                    {children}
                </div>
            }
        />
    );
};

export default AnimateOnMount;
