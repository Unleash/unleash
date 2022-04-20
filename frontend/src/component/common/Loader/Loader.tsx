import logo from 'assets/img/unleashLogoIconDarkAlpha.gif';
import { formatAssetPath } from 'utils/formatPath';
import { useStyles } from './Loader.styles';

const Loader = () => {
    const styles = useStyles();

    return (
        <div className={styles.loader} role="alert" aria-label="Loading">
            <img className={styles.img} src={formatAssetPath(logo)} alt="" />
        </div>
    );
};

export default Loader;
