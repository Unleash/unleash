import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { SearchSuggestions } from './SearchSuggestions';

const searchContext = {
    data: [
        {
            title: 'Title A',
            environment: 'prod',
        },
        {
            title: 'Title B',
            environment: 'dev env',
        },
        {
            title: 'Title C',
            environment: 'stage\npre-prod',
        },
    ],
    searchValue: '',
    columns: [
        {
            Header: 'Title',
            searchable: true,
            accessor: 'title',
        },
        {
            Header: 'Environment',
            accessor: 'environment',
            searchable: false,
            filterName: 'environment',
        },
    ],
};

test('displays search and filter instructions when no search value is provided', () => {
    render(<SearchSuggestions getSearchContext={() => searchContext} />);

    expect(
        screen.getByText(/Filter your search with operators like:/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/Filter by Environment:/i)).toBeInTheDocument();

    expect(
        screen.getByText(/environment:"dev env",pre-prod/i)
    ).toBeInTheDocument();

    expect(
        screen.getByText(/Combine filters and search./i)
    ).toBeInTheDocument();
});

test('displays search and filter instructions when search value is provided', () => {
    render(
        <SearchSuggestions
            getSearchContext={() => ({
                ...searchContext,
                searchValue: 'Title',
            })}
        />
    );

    expect(screen.getByText(/Searching for:/i)).toBeInTheDocument();
    expect(screen.getByText(/in Title/i)).toBeInTheDocument();
    expect(
        screen.getByText(/Combine filters and search./i)
    ).toBeInTheDocument();
});

test('displays search and filter instructions when filter value is provided', () => {
    render(
        <SearchSuggestions
            getSearchContext={() => ({
                ...searchContext,
                searchValue: 'environment:prod',
            })}
        />
    );

    expect(screen.getByText(/Filtering by:/i)).toBeInTheDocument();
    expect(screen.getByText(/in Environment/i)).toBeInTheDocument();
    expect(
        screen.getByText(/Options: "dev env", pre-prod, prod, stage/i)
    ).toBeInTheDocument();
    expect(
        screen.getByText(/Combine filters and search./i)
    ).toBeInTheDocument();
});
