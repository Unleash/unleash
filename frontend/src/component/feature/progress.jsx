import React, { PropTypes, Component } from 'react';
import styles from './progress-styles.scss';

class Progress extends Component {
    constructor (props) {
        super(props);

        this.state = {
            percentage: props.initialAnimation ? 0 : props.percentage,
            percentageText: props.initialAnimation ? 0 : props.percentage,
        };
    }

    componentDidMount () {
        if (this.props.initialAnimation) {
            this.initialTimeout = setTimeout(() => {
                this.rafTimerInit = window.requestAnimationFrame(() => {
                    this.setState({
                        percentage: this.props.percentage,
                    });
                });
            }, 0);
        }
    }

    componentWillReceiveProps ({ percentage }) {
        if (this.state.percentage !== percentage) {
            const nextState = { percentage };
            if (this.props.animatePercentageText) {
                this.animateTo(percentage, this.getTarget(percentage));
            } else {
                nextState.percentageText = percentage;
            }
            this.setState(nextState);
        }
    }

    getTarget (target) {
        const start = this.state.percentageText;
        const TOTAL_ANIMATION_TIME = 10000;
        const diff = start > target ? -(start - target) : target - start;
        const perCycle = TOTAL_ANIMATION_TIME / diff;
        const cyclesCounter = Math.round(Math.abs(TOTAL_ANIMATION_TIME / perCycle));
        const perCycleTime = Math.round(Math.abs(perCycle));

        let usedTime = 0;
        // this initial value could be tweaked more
        let lastTime = perCycleTime / 4;
        return {
            start,
            target,
            cyclesCounter,
            getTimer () {
                /* Somewhat tweaked values to get a curve on the counting */
                if (usedTime > (TOTAL_ANIMATION_TIME / 2)) {
                    // if halfway, lets speed up timeouts
                    lastTime *= 0.95;
                } else {
                    lastTime *= 1.1;
                }
                usedTime += lastTime;
                return lastTime;
            },
            increment: diff / cyclesCounter,
        };
    }

    animateTo (percentage, targetState) {
        cancelAnimationFrame(this.rafCounterTimer);
        clearTimeout(this.nextTimer);

        const current = this.state.percentageText;

        targetState.cyclesCounter --;
        if (targetState.cyclesCounter <= 0) {
            this.setState({ percentageText: targetState.target });
            return;
        }

        const next = Math.round(current + targetState.increment);
        this.rafCounterTimer = requestAnimationFrame(() => {
            this.setState({ percentageText: next });
            this.nextTimer = setTimeout(() => {
                this.animateTo(next, targetState);
            }, targetState.getTimer());
        });
    }


    componentWillUnmount () {
        clearTimeout(this.initialTimeout);
        clearTimeout(this.nextTimer);
        window.cancelAnimationFrame(this.rafTimerInit);
        window.cancelAnimationFrame(this.rafCounterTimer);
    }

    render () {
        const { strokeWidth } = this.props;
        const radius = (50 - strokeWidth / 2);
        const pathDescription = `
      M 50,50 m 0,-${radius}
      a ${radius},${radius} 0 1 1 0,${2 * radius}
      a ${radius},${radius} 0 1 1 0,-${2 * radius}
    `;

        const diameter = Math.PI * 2 * radius;
        const progressStyle = {
            strokeDasharray: `${diameter}px ${diameter}px`,
            strokeDashoffset: `${((100 - this.state.percentage) / 100 * diameter)}px`,
        };

        return (<svg viewBox="0 0 100 100">
            <path
                className={styles.trail}
                d={pathDescription}
                strokeWidth={strokeWidth}
                fillOpacity={0}
                />

            <path
                className={styles.path}
                d={pathDescription}
                strokeWidth={strokeWidth}
                fillOpacity={0}
                style={progressStyle}
                />

            <text
                className={styles.text}
                x={50}
                y={50}
                >{this.state.percentageText}%</text>
        </svg>);
    }
}

Progress.propTypes = {
    percentage: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number,
    initialAnimation: PropTypes.bool,
    animatePercentageText: PropTypes.bool,
    textForPercentage: PropTypes.func,
};

Progress.defaultProps = {
    strokeWidth: 8,
    animatePercentageText: false,
    initialAnimation: false,
};

export default Progress;
