import { useStyles } from 'component/context/ContectFormChip/ContextFormChip.styles';
import { Cancel } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IContextFormChipProps {
    label: string;
    description?: string;
    onRemove: () => void;
}

export const ContextFormChip = ({
    label,
    description,
    onRemove,
}: IContextFormChipProps) => {
    const { classes: styles } = useStyles();

    return (
        <li className={styles.container}>
            <div>
                <div className={styles.label}>{label}</div>
                <ConditionallyRender
                    condition={Boolean(description)}
                    show={() => (
                        <div className={styles.description}>{description}</div>
                    )}
                />
            </div>
            <button onClick={onRemove} className={styles.button}>
                <Cancel titleAccess="Remove" />
            </button>
        </li>
    );
};
