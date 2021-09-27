import { Switch } from '@material-ui/core';
import { useStyles } from './FeatureViewEnvironment.styles';

const FeatureViewEnvironment = ({ env }: any) => {
    const styles = useStyles();
    return (
        <div style={{ width: '100%', marginBottom: '1rem' }}>
            <div className={styles.environmentContainer}>
                <Switch value={env.enabled} checked={env.enabled} /> Toggle in{' '}
                {env.name} is {env.enabled ? 'enabled' : 'disabled'}
            </div>
        </div>
    );
};

export default FeatureViewEnvironment;
