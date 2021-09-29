import { CloudCircle } from '@material-ui/icons';
import { ICreateEnvironmentSuccessProps } from '../CreateEnvironmentSuccess';
import { useStyles } from './CreateEnvironmentSuccessCard.styles';

const CreateEnvironmentSuccessCard = ({
    name,
    type,
}: ICreateEnvironmentSuccessProps) => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <CloudCircle className={styles.icon} /> Environment
            </div>

            <div className={styles.infoContainer}>
                <div className={styles.infoInnerContainer}>
                    <div className={styles.infoTitle}>Id</div>
                    <div>{name}</div>
                </div>
                <div className={styles.infoInnerContainer}>
                    <div className={styles.infoTitle}>Type</div>
                    <div>{type}</div>
                </div>
            </div>
        </div>
    );
};

export default CreateEnvironmentSuccessCard;
