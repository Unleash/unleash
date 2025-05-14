import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { SearchSuggestions } from './SearchSuggestions.tsx';

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

const searchContextWithoutFilters = {
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
            searchable: true,
        },
    ],
};

test('displays search and filter instructions when no search value is provided', () => {
    let recordedSuggestion = '';
    render(
        <SearchSuggestions
            onSuggestion={(suggestion) => {
                recordedSuggestion = suggestion;
            }}
            getSearchContext={() => searchContext}
        />,
    );

    expect(screen.getByText(/Filter your results by:/i)).toBeInTheDocument();

    expect(screen.getByText(/Environment:/)).toBeInTheDocument();

    expect(
        screen.getByText(/environment:"dev env",pre-prod/i),
    ).toBeInTheDocument();

    expect(
        screen.getByText(/Combine filters and search./i),
    ).toBeInTheDocument();

    screen.getByText(/environment:"dev env",pre-prod/i).click();
    expect(recordedSuggestion).toBe('environment:"dev env",pre-prod');
});

test('displays search and filter instructions when search value is provided', () => {
    render(
        <SearchSuggestions
            onSuggestion={() => {}}
            getSearchContext={() => ({
                ...searchContext,
                searchValue: 'Title',
            })}
        />,
    );

    expect(screen.getByText(/Searching for:/i)).toBeInTheDocument();
    expect(screen.getByText(/in Title/i)).toBeInTheDocument();
    expect(
        screen.getByText(/Combine filters and search./i),
    ).toBeInTheDocument();
});

test('displays search and filter instructions when filter value is provided', () => {
    let recordedSuggestion = '';
    render(
        <SearchSuggestions
            onSuggestion={(suggestion) => {
                recordedSuggestion = suggestion;
            }}
            getSearchContext={() => ({
                ...searchContext,
                searchValue: 'environment:prod',
            })}
        />,
    );

    expect(screen.getByText(/Filtering by:/i)).toBeInTheDocument();
    expect(screen.getByText(/in Environment/i)).toBeInTheDocument();
    expect(
        screen.getByText(/Options: "dev env", pre-prod, prod, stage/i),
    ).toBeInTheDocument();
    expect(
        screen.getByText(/Combine filters and search./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/environment:"dev env"/i)).toBeInTheDocument();
    expect(screen.getByText(/Title A/i)).toBeInTheDocument();

    screen.getByText(/Title A/i).click();
    expect(recordedSuggestion).toBe('environment:"dev env" Title A');
});

test('displays search instructions without filters', () => {
    let recordedSuggestion = '';
    render(
        <SearchSuggestions
            onSuggestion={(suggestion) => {
                recordedSuggestion = suggestion;
            }}
            getSearchContext={() => searchContextWithoutFilters}
        />,
    );

    expect(
        screen.getByText(/Start typing to search in Title, Environment/i),
    ).toBeInTheDocument();

    screen.getByText(/Title A/i).click();
    expect(recordedSuggestion).toBe('Title A');
});
