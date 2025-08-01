import type { FC } from 'react';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { styled } from '@mui/material';

const StyledContainer = styled('div')(() => ({
    maxWidth: '200px',
    width: '100%',
}));

export const sortKeys = ['name', 'created', 'updated', 'seen'] as const;

const options: Array<{
    key: (typeof sortKeys)[number];
    label: string;
}> = [
    { key: 'name', label: 'Project name' },
    { key: 'created', label: 'Recently created' },
    { key: 'updated', label: 'Last updated' },
    { key: 'seen', label: 'Last usage reported' },
];

type ProjectsListSortProps = {
    sortBy: string | null | undefined;
    setSortBy: (value: string) => void;
};

export const ProjectsListSort: FC<ProjectsListSortProps> = ({
    sortBy,
    setSortBy,
}) => {
    return (
        <StyledContainer>
            <GeneralSelect
                fullWidth
                label='Sort by'
                onChange={setSortBy}
                options={options}
                value={sortBy || options[0].key}
            />
        </StyledContainer>
    );
};
