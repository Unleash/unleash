import React from 'react';
import GeneralSelect from '../GeneralSelect/GeneralSelect';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';

interface ITagSelect extends React.SelectHTMLAttributes<HTMLSelectElement> {
    value: string;
    onChange: (val: any) => void;
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
            {/* @ts-expect-error */}
            <GeneralSelect
                label="Tag type"
                name="tag-select"
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
