import React, { PropTypes, Component } from 'react';
import styles from './progress-styles.scss';

class Progress extends Component {
    constructor (props) {
        super(props);

        this.state = {
            percentage: props.initialAnimation ? 0 : props.percentage,
        };
    }

    componentDidMount () {
        if (this.props.initialAnimation) {
            this.initialTimeout = setTimeout(() => {
                this.requestAnimationFrame = window.requestAnimationFrame(() => {
                    this.setState({
                        percentage: this.props.percentage,
                    });
                });
            }, 0);
        }
    }

    componentWillReceiveProps ({ percentage }) {
        this.setState({ percentage });
    }

    componentWillUnmount () {
        clearTimeout(this.initialTimeout);
        window.cancelAnimationFrame(this.requestAnimationFrame);
    }

    render () {
        const { strokeWidth, percentage } = this.props;
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
                >{percentage}%</text>
        </svg>);
    }
}

Progress.propTypes = {
    percentage: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number,
    initialAnimation: PropTypes.bool,
    textForPercentage: PropTypes.func,
};

Progress.defaultProps = {
    strokeWidth: 8,
    initialAnimation: false,
};

export default Progress;
