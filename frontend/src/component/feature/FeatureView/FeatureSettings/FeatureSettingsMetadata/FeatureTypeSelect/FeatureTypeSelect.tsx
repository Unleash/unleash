import useFeatureTypes from '../../../../../../hooks/api/getters/useFeatureTypes/useFeatureTypes';
import GeneralSelect, {
    ISelectOption,
} from '../../../../../common/GeneralSelect/GeneralSelect';

const FeatureTypeSelect = ({
    editable,
    value,
    id,
    label,
    onChange,
    ...rest
}) => {
    const { featureTypes } = useFeatureTypes();

    const options: ISelectOption[] = featureTypes.map(t => ({
        key: t.id,
        label: t.name,
        title: t.description,
    }));

    if (!options.some(o => o.key === value)) {
        options.push({ key: value, label: value });
    }

    return (
        <GeneralSelect
            disabled={!editable}
            options={options}
            value={value}
            onChange={onChange}
            label={label}
            id={id}
            {...rest}
        />
    );
};

export default FeatureTypeSelect;
