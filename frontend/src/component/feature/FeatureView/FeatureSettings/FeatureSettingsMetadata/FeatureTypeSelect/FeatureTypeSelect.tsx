import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import GeneralSelect, {
    ISelectOption,
} from 'component/common/GeneralSelect/GeneralSelect';

const FeatureTypeSelect = ({
    // @ts-expect-error
    editable,
    // @ts-expect-error
    value,
    // @ts-expect-error
    id,
    // @ts-expect-error
    label,
    // @ts-expect-error
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
        <>
            <GeneralSelect
                disabled={!editable}
                options={options}
                value={value}
                onChange={onChange}
                label={label}
                id={id}
                {...rest}
            />
        </>
    );
};

export default FeatureTypeSelect;
