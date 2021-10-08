import { useTheme } from '@material-ui/core';

interface IPercentageCircleProps {
    styles?: object;
    percentage: number;
    secondaryPieColor?: string;
}

const PercentageCircle = ({
    styles,
    percentage,
    secondaryPieColor,
}: IPercentageCircleProps) => {
    const theme = useTheme();

    let circle = {
        height: '65px',
        width: '65px',
        borderRadius: '50%',
        color: '#fff',
        backgroundColor: theme.palette.grey[200],
        backgroundImage: `conic-gradient(${
            theme.palette.primary.main
        } ${percentage}%, ${secondaryPieColor || theme.palette.grey[200]} 1%)`,
    };

    if (percentage === 100) {
        return (
            <div
                style={{
                    ...circle,
                    ...styles,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                100%
            </div>
        );
    }

    return <div style={{ ...circle, ...styles }} />;
};

export default PercentageCircle;
