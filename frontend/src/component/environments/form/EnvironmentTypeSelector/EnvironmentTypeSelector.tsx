import {
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
} from '@material-ui/core';
import { useStyles } from './EnvironmentTypeSelector.styles';

interface IEnvironmentTypeSelectorProps {
    onChange: (event: React.FormEvent<HTMLInputElement>) => void;
    value: string;
}

const EnvironmentTypeSelector = ({
    onChange,
    value,
}: IEnvironmentTypeSelectorProps) => {
    const styles = useStyles();
    return (
        <FormControl component="fieldset">
            <h3 className={styles.formHeader} data-loading>
                Environment Type
            </h3>

            <RadioGroup
                data-loading
                value={value}
                onChange={onChange}
                className={styles.radioGroup}
            >
                <div className={styles.radioBtnGroup}>
                    <FormControlLabel
                        value="development"
                        label="Development"
                        control={<Radio />}
                    />
                    <FormControlLabel
                        value="test"
                        label="Test"
                        control={<Radio />}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormControlLabel
                        value="preproduction"
                        label="Pre production"
                        control={<Radio />}
                    />
                    <FormControlLabel
                        value="production"
                        label="Production"
                        control={<Radio />}
                    />
                </div>
            </RadioGroup>
        </FormControl>
    );
};

export default EnvironmentTypeSelector;
