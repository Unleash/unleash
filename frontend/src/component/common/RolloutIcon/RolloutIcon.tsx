import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Remove from '@mui/icons-material/Remove';
import { useStyles } from './RolloutIcon.styles';
import classnames from 'classnames';

interface IRolloutIconProps {
    className?: string;
}

const RolloutIcon = ({ className }: IRolloutIconProps) => {
    const { classes: styles } = useStyles();
    return (
        <div className={styles.container}>
            <Remove
                className={classnames(styles.vertical, styles.pos, className)}
            />
            <FiberManualRecordIcon
                className={classnames(styles.circle, styles.pos, className)}
            />
        </div>
    );
};

export default RolloutIcon;
