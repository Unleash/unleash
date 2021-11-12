import { useTheme } from '@material-ui/core/styles';
import { Cloud } from '@material-ui/icons';

interface IEnvironmentIcon {
    enabled: boolean;
    className?: string;
}

const EnvironmentIcon = ({ enabled, className }: IEnvironmentIcon) => {
    const theme = useTheme();

    const container = {
        backgroundColor: enabled
            ? theme.palette.primary.light
            : theme.palette.grey[600],
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        minWidth: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '0.5rem',
    };

    const icon = {
        fill: '#fff',
        width: '17px',
        height: '17px',
    };

    return (
        <div style={container} className={className}>
            <Cloud style={icon} />
        </div>
    );
};

export default EnvironmentIcon;
