import {
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import { useStyles } from './EnvironmentTypeSelector.styles';
import React from 'react';

interface IEnvironmentTypeSelectorProps {
    onChange: (event: React.FormEvent<HTMLInputElement>) => void;
    value: string;
}

const EnvironmentTypeSelector = ({
    onChange,
    value,
}: IEnvironmentTypeSelectorProps) => {
    const { classes: styles } = useStyles();
    return (
        <FormControl component="fieldset">
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
