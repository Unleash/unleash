import { useEffect, useState, useRef, FC } from 'react';
import ConditionallyRender from '../ConditionallyRender';

interface IAnimateOnMountProps {
    mounted: boolean;
    enter: string;
    start: string;
    leave: string;
    container?: string;
    style?: Object;
}

const AnimateOnMount: FC<IAnimateOnMountProps> = ({
    mounted,
    enter,
    start,
    leave,
    container,
    children,
    style,
}) => {
    const [show, setShow] = useState(mounted);
    const [styles, setStyles] = useState('');
    const mountedRef = useRef<null | boolean>(null);

    useEffect(() => {
        if (mountedRef.current !== mounted || mountedRef === null) {
            if (mounted) {
                setShow(true);
                setTimeout(() => {
                    setStyles(enter);
                }, 50);
            } else {
                if (!leave) {
                    setShow(false);
                }
                setStyles(leave);
            }
        }
    }, [mounted, enter, leave]);

    const onTransitionEnd = () => {
        if (!mounted) {
            setShow(false);
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
