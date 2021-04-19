import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './progress.module.scss';

const Progress = ({
    percentage,
    strokeWidth = 10,
    initialAnimation = false,
    animatePercentageText = false,
    textForPercentage,
    colorClassName,
    isFallback = false,
}) => {
    const [localPercentage, setLocalPercentage] = useState({
        percentage: initialAnimation ? 0 : percentage,
        percentageText: initialAnimation ? 0 : percentage,
    });
    const timeoutId = useRef();
    const rafTimerInit = useRef();
    const rafCounterTimer = useRef();
    const nextTimer = useRef();

    useEffect(() => {
        if (initialAnimation) {
            timeoutId.current = setTimeout(() => {
                rafTimerInit.current = window.requestAnimationFrame(() => {
                    setLocalPercentage(prev => ({ ...prev, percentage }));
                });
            }, 0);
        }

        return () => {
            clearTimeout(timeoutId.current);
            clearTimeout(nextTimer);
            window.cancelAnimationFrame(rafTimerInit.current);
            window.cancelAnimationFrame(rafCounterTimer.current);
        };
        /* eslint-disable-next-line */
    }, []);

    useEffect(() => {
        if (percentage !== localPercentage) {
            const nextState = { percentage };
            if (animatePercentageText) {
                animateTo(percentage, getTarget(percentage));
            } else {
                nextState.percentageText = percentage;
            }
            setLocalPercentage(prev => ({ ...prev, ...nextState }));
        }
        /* eslint-disable-next-line */
    }, [percentage]);

    const getTarget = target => {
        const start = localPercentage.percentageText;
        const TOTAL_ANIMATION_TIME = 5000;
        const diff = start > target ? -(start - target) : target - start;
        const perCycle = TOTAL_ANIMATION_TIME / diff;
        const cyclesCounter = Math.round(
            Math.abs(TOTAL_ANIMATION_TIME / perCycle)
        );
        const perCycleTime = Math.round(Math.abs(perCycle));

        return {
            start,
            target,
            cyclesCounter,
            perCycleTime,
            increment: diff / cyclesCounter,
        };
    };

    const animateTo = (percentage, targetState) => {
        cancelAnimationFrame(rafCounterTimer.current);
        clearTimeout(nextTimer.current);

        const current = localPercentage.percentageText;

        targetState.cyclesCounter--;
        if (targetState.cyclesCounter <= 0) {
            setLocalPercentage({ percentageText: targetState.target });
            return;
        }

        const next = Math.round(current + targetState.increment);
        rafCounterTimer.current = requestAnimationFrame(() => {
            setLocalPercentage({ percentageText: next });
            nextTimer.current = setTimeout(() => {
                animateTo(next, targetState);
            }, targetState.perCycleTime);
        });
    };

    const radius = 50 - strokeWidth / 2;
    const pathDescription = `
      M 50,50 m 0,-${radius}
      a ${radius},${radius} 0 1 1 0,${2 * radius}
      a ${radius},${radius} 0 1 1 0,-${2 * radius}
    `;

    const diameter = Math.PI * 2 * radius;
    const progressStyle = {
        strokeDasharray: `${diameter}px ${diameter}px`,
        strokeDashoffset: `${
            ((100 - localPercentage.percentage) / 100) * diameter
        }px`,
    };

    return isFallback ? (
        <svg viewBox="0 0 24 24">
            {
                // eslint-disable-next-line max-len
            }
            <path
                fill="#E0E0E0"
                d="M17.3,18C19,16.5 20,14.4 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12C4,14.4 5,16.5 6.7,18C8.2,16.7 10,16 12,16C14,16 15.9,16.7 17.3,18M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M7,9A1,1 0 0,1 8,10A1,1 0 0,1 7,11A1,1 0 0,1 6,10A1,1 0 0,1 7,9M10,6A1,1 0 0,1 11,7A1,1 0 0,1 10,8A1,1 0 0,1 9,7A1,1 0 0,1 10,6M17,9A1,1 0 0,1 18,10A1,1 0 0,1 17,11A1,1 0 0,1 16,10A1,1 0 0,1 17,9M14.4,6.1C14.9,6.3 15.1,6.9 15,7.4L13.6,10.8C13.8,11.1 14,11.5 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12C10,11 10.7,10.1 11.7,10L13.1,6.7C13.3,6.1 13.9,5.9 14.4,6.1Z"
            />
        </svg>
    ) : (
        <svg viewBox="0 0 100 100">
            <path
                className={styles.trail}
                d={pathDescription}
                strokeWidth={strokeWidth}
                fillOpacity={0}
            />

            <path
                className={[styles.path, colorClassName].join(' ')}
                d={pathDescription}
                strokeWidth={strokeWidth}
                fillOpacity={0}
                style={progressStyle}
            />

            <text className={styles.text} x={50} y={50}>
                {localPercentage.percentageText}%
            </text>
        </svg>
    );
};

Progress.propTypes = {
    percentage: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number,
    initialAnimation: PropTypes.bool,
    animatePercentageText: PropTypes.bool,
    textForPercentage: PropTypes.func,
    colorClassName: PropTypes.string,
    isFallback: PropTypes.bool,
};

export default Progress;
