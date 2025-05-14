import { createLocalStorage } from 'utils/createLocalStorage';
import { render } from 'utils/testRenderer';
import { fireEvent, screen } from '@testing-library/react';
import { Search } from './Search.tsx';
import { SEARCH_INPUT } from 'utils/testIds';

const testDisplayComponent = (
    <Search
        hasFilters
        onChange={() => {}}
        id='localStorageId'
        getSearchContext={() => ({
            data: [],
            columns: [],
            searchValue: '',
        })}
    />
);

test('should read saved query from local storage', async () => {
    const { setValue } = createLocalStorage('Search:localStorageId:v1', {});
    setValue({
        query: 'oldquery',
    });

    render(testDisplayComponent);

    const input = screen.getByTestId(SEARCH_INPUT);

    input.focus();

    await screen.findByText('oldquery'); // local storage saved search query

    screen.getByText('oldquery').click(); // click history hint

    expect(await screen.findByDisplayValue('oldquery')).toBeInTheDocument(); // check if input updates

    fireEvent.change(input, { target: { value: 'newquery' } });

    expect(screen.getByText('newquery')).toBeInTheDocument(); // new saved query updated
});

test('should update saved query without local storage', async () => {
    render(testDisplayComponent);

    const input = screen.getByTestId(SEARCH_INPUT);

    input.focus();

    fireEvent.change(input, { target: { value: 'newquery' } });

    expect(screen.getByText('newquery')).toBeInTheDocument(); // new saved query updated
});

test('should still render history if no search context', async () => {
    const { setValue } = createLocalStorage('Search:localStorageId:v1', {});
    setValue({
        query: 'oldquery',
    });

    render(<Search onChange={() => {}} id='localStorageId' />);

    const input = screen.getByTestId(SEARCH_INPUT);

    input.focus();

    await screen.findByText('oldquery');
});
