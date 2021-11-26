import logo from '../../../assets/img/unleash_logo_icon_dark _ alpha.gif';
import { useStyles } from './Loader.styles';

const Loader = () => {
    const styles = useStyles();

    return (
        <div className={styles.loader}>
            <img className={styles.img} src={logo} alt="loading..." />
        </div>
    );
};

export default Loader;
