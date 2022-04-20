import React from 'react';
import GeneralSelect, {
    IGeneralSelectProps,
} from '../GeneralSelect/GeneralSelect';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';

interface ITagSelect {
    name: string;
    value: string;
    onChange: IGeneralSelectProps['onChange'];
    autoFocus?: boolean;
}

const TagSelect = ({ value, onChange, ...rest }: ITagSelect) => {
    const { tagTypes } = useTagTypes();

    const options = tagTypes.map(tagType => ({
        key: tagType.name,
        label: tagType.name,
        title: tagType.name,
    }));

    return (
        <>
            <GeneralSelect
                label="Tag type"
                id="tag-select"
                options={options}
                value={value}
                onChange={onChange}
                {...rest}
            />
        </>
    );
};

export default TagSelect;
