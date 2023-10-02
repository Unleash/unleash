import Input from 'component/common/Input/Input';
import { makeStyles } from 'tss-react/mui';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';

interface ISingleValueProps {
    setValue: (value: string) => void;
    value?: string;
    type: string;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles()(theme => ({
    singleValueContainer: { maxWidth: '300px', marginTop: '-1rem' },
    singleValueInput: {
        width: '100%',
        margin: '1rem 0',
    },
}));

export const SingleValue = ({
    setValue,
    value,
    type,
    error,
    setError,
}: ISingleValueProps) => {
    const { classes: styles } = useStyles();
    return (
        <>
            <ConstraintFormHeader>
                Add a single {type.toLowerCase()} value
            </ConstraintFormHeader>
            <div className={styles.singleValueContainer}>
                <Input
                    label={type}
                    name="value"
                    value={value || ''}
                    onChange={e => {
                        setError('');
                        setValue(e.target.value.trim());
                    }}
                    onFocus={() => setError('')}
                    placeholder={`Enter a single ${type} value`}
                    className={styles.singleValueInput}
                    error={Boolean(error)}
                    errorText={error}
                />
            </div>
        </>
    );
};
