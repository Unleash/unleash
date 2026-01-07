import type { FC } from 'react';
import { useParentOptions } from 'hooks/api/getters/useFeatureDependencyOptions/useFeatureDependencyOptions';
import { REMOVE_DEPENDENCY_OPTION } from './constants.ts';
import { StyledSelect } from './FeatureStatusOptions.tsx';

// Project can have 100s of parents. We want to read them only when the modal for dependencies opens.
export const LazyParentOptions: FC<{
    project: string;
    featureId: string;
    parent: string;
    onSelect: (parent: string) => void;
}> = ({ project, featureId, parent, onSelect }) => {
    const { parentOptions } = useParentOptions(project, featureId);

    const options = parentOptions
        ? [
              REMOVE_DEPENDENCY_OPTION,
              ...parentOptions.map((parent) => ({
                  key: parent,
                  label: parent,
              })),
          ]
        : [REMOVE_DEPENDENCY_OPTION];

    return (
        <StyledSelect
            fullWidth
            options={options}
            value={parent}
            onChange={onSelect}
        />
    );
};
