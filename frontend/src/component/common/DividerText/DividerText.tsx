import { Typography } from '@mui/material';
import { useStyles } from 'component/common/DividerText/DividerText.styles';

interface IDividerTextProps {
    text: string;
}

const DividerText = ({ text, ...rest }: IDividerTextProps) => {
    const { classes: styles } = useStyles();

    return (
        <div className={styles.container} {...rest}>
            <span className={styles.wing} />
            <Typography variant="body2" className={styles.text}>
                {text}
            </Typography>
            <span className={styles.wing} />
        </div>
    );
};

export default DividerText;
