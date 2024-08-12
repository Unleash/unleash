import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import GeneralSelect, {
    type ISelectOption,
    type IGeneralSelectProps,
} from 'component/common/GeneralSelect/GeneralSelect';
import type { CreateFeatureSchemaType } from 'openapi';

interface IFeatureTypeSelectProps
    extends Omit<
        IGeneralSelectProps<CreateFeatureSchemaType>,
        'options' | 'value'
    > {
    value: CreateFeatureSchemaType;
    editable: boolean;
}

const FeatureTypeSelect = ({
    editable,
    value,
    id,
    label,
    onChange,
    ...rest
}: IFeatureTypeSelectProps) => {
    const { featureTypes } = useFeatureTypes();

    const options: ISelectOption[] = featureTypes.map((t) => ({
        key: t.id,
        label: t.name,
        title: t.description,
    }));

    if (!options.some((o) => o.key === value)) {
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
