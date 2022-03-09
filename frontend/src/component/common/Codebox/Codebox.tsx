import { useStyles } from './Codebox.styles';

interface ICodeboxProps {
    text: string;
}

const Codebox = ({ text }: ICodeboxProps) => {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <pre className={styles.code}>{text}</pre>
        </div>
    );
};

export default Codebox;
