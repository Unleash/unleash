import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useState } from 'react';

const options = [
    { key: 'AND', label: 'In all of these segments' },
    { key: 'OR', label: 'In any of these segments' },
];

export const SegmentOperatorSelect = () => {
    const [operator, setOperator] = useState('AND');

    return (
        <GeneralSelect
            label='Segment matching'
            visuallyHideLabel
            size='small'
            fullWidth={false}
            value={operator}
            options={options}
            onChange={setOperator}
        />
    );
};
