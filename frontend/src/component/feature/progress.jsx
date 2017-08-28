import React, { PropTypes, Component } from 'react';
import styles from './progress-styles.scss';

class Progress extends Component {
    constructor(props) {
        super(props);

        this.state = {
            percentage: props.initialAnimation ? 0 : props.percentage,
            percentageText: props.initialAnimation ? 0 : props.percentage,
        };
    }

    componentDidMount() {
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

    componentWillReceiveProps({ percentage }) {
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

    getTarget(target) {
        const start = this.state.percentageText;
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
    }

    animateTo(percentage, targetState) {
        cancelAnimationFrame(this.rafCounterTimer);
        clearTimeout(this.nextTimer);

        const current = this.state.percentageText;

        targetState.cyclesCounter--;
        if (targetState.cyclesCounter <= 0) {
            this.setState({ percentageText: targetState.target });
            return;
        }

        const next = Math.round(current + targetState.increment);
        this.rafCounterTimer = requestAnimationFrame(() => {
            this.setState({ percentageText: next });
            this.nextTimer = setTimeout(() => {
                this.animateTo(next, targetState);
            }, targetState.perCycleTime);
        });
    }

    componentWillUnmount() {
        clearTimeout(this.initialTimeout);
        clearTimeout(this.nextTimer);
        window.cancelAnimationFrame(this.rafTimerInit);
        window.cancelAnimationFrame(this.rafCounterTimer);
    }

    render() {
        const { strokeWidth, colorClassName, isFallback } = this.props;
        const radius = 50 - strokeWidth / 2;
        const pathDescription = `
      M 50,50 m 0,-${radius}
      a ${radius},${radius} 0 1 1 0,${2 * radius}
      a ${radius},${radius} 0 1 1 0,-${2 * radius}
    `;

        const diameter = Math.PI * 2 * radius;
        const progressStyle = {
            strokeDasharray: `${diameter}px ${diameter}px`,
            strokeDashoffset: `${(100 - this.state.percentage) /
                100 *
                diameter}px`,
        };

        return isFallback ? (
            <svg viewBox="0 0 24 24" className="mdl-color-text--grey-300">
                {
                    // eslint-disable-next-line max-len
                }
                <path
                    fill="currentColor"
                    d="M17.3,18C19,16.5 20,14.4 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12C4,14.4 5,16.5 6.7,18C8.2,16.7 10,16 12,16C14,16 15.9,16.7 17.3,18M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M7,9A1,1 0 0,1 8,10A1,1 0 0,1 7,11A1,1 0 0,1 6,10A1,1 0 0,1 7,9M10,6A1,1 0 0,1 11,7A1,1 0 0,1 10,8A1,1 0 0,1 9,7A1,1 0 0,1 10,6M17,9A1,1 0 0,1 18,10A1,1 0 0,1 17,11A1,1 0 0,1 16,10A1,1 0 0,1 17,9M14.4,6.1C14.9,6.3 15.1,6.9 15,7.4L13.6,10.8C13.8,11.1 14,11.5 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12C10,11 10.7,10.1 11.7,10L13.1,6.7C13.3,6.1 13.9,5.9 14.4,6.1Z"
                />
            </svg>
        ) : (
            <svg viewBox="0 0 100 100">
                <path
                    className={[styles.trail, 'mdl-color-text--grey-300'].join(
                        ' '
                    )}
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
                    {this.state.percentageText}%
                </text>
            </svg>
        );
    }
}

Progress.propTypes = {
    percentage: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number,
    initialAnimation: PropTypes.bool,
    animatePercentageText: PropTypes.bool,
    textForPercentage: PropTypes.func,
    colorClassName: PropTypes.string,
    isFallback: PropTypes.bool,
};

Progress.defaultProps = {
    strokeWidth: 10,
    animatePercentageText: false,
    initialAnimation: false,
    colorClassName: 'mdl-color-text--primary',
    isFallback: false,
};

export default Progress;
