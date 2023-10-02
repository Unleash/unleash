import { createLocalStorage } from 'utils/createLocalStorage';
import { render } from 'utils/testRenderer';
import { fireEvent, screen } from '@testing-library/react';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';
import { Search } from './Search';
import { SEARCH_INPUT } from 'utils/testIds';

const testDisplayComponent = (
    <UIProviderContainer>
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
    </UIProviderContainer>
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

    expect(screen.getByDisplayValue('oldquery')).toBeInTheDocument(); // check if input updates

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
