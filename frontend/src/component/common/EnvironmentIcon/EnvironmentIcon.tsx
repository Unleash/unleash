import { useTheme } from '@mui/material/styles';
import { Cloud } from '@mui/icons-material';

interface IEnvironmentIcon {
    enabled: boolean;
    className?: string;
}

const EnvironmentIcon = ({ enabled, className }: IEnvironmentIcon) => {
    const theme = useTheme();

    const title = enabled ? 'Environment enabled' : 'Environment disabled';

    const container = {
        backgroundColor: enabled
            ? theme.palette.primary.light
            : theme.palette.neutral.border,
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        minWidth: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing(1),
    };

    const icon = {
        fill: '#fff',
        width: '16px',
        height: '16px',
    };

    return (
        <div style={container} className={className}>
            <Cloud style={icon} titleAccess={title} />
        </div>
    );
};

export default EnvironmentIcon;
