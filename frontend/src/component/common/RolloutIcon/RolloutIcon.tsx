import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Remove from '@material-ui/icons/Remove';
import { useStyles } from './RolloutIcon.styles';
import classnames from 'classnames';

interface IRolloutIconProps {
    className?: string;
}

const RolloutIcon = ({ className }: IRolloutIconProps) => {
    const styles = useStyles();
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
