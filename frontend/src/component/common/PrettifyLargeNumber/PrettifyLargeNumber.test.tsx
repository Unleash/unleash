import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { PrettifyLargeNumber } from './PrettifyLargeNumber';
import { LARGE_NUMBER_PRETTIFIED } from 'utils/testIds';

describe('PrettifyLargeNumber', () => {
    it('should render number with separator for value less than threshold', async () => {
        render(<PrettifyLargeNumber value={999999} threshold={1000000} />);

        const prettifiedText = await screen.getByTestId(
            LARGE_NUMBER_PRETTIFIED
        );

        expect(prettifiedText.textContent).toBe('999,999');
    });

    it('should render prettified number for value equal to the threshold', async () => {
        render(<PrettifyLargeNumber value={1000000} threshold={1000000} />);

        const prettifiedText = await screen.getByTestId(
            LARGE_NUMBER_PRETTIFIED
        );

        expect(prettifiedText.textContent).toBe('1M');
    });

    it('should render prettified number for value greater than threshold', async () => {
        render(<PrettifyLargeNumber value={12345678} threshold={1000000} />);

        const prettifiedText = await screen.getByTestId(
            LARGE_NUMBER_PRETTIFIED
        );

        expect(prettifiedText.textContent).toBe('12.35M');
    });

    it('should render prettified number with tooltip having raw value for value greater than threshold', async () => {
        render(<PrettifyLargeNumber value={12345678} threshold={1000000} />);

        const prettifiedText = await screen.getByTestId(
            LARGE_NUMBER_PRETTIFIED
        );

        expect(prettifiedText.getAttribute('aria-label')).toBe('12,345,678');
    });

    it('should render prettified number with provided significant figures for value greater than threshold', async () => {
        render(
            <PrettifyLargeNumber
                value={12345678}
                threshold={1000000}
                precision={4}
            />
        );

        const prettifiedText = await screen.getByTestId(
            LARGE_NUMBER_PRETTIFIED
        );

        expect(prettifiedText.textContent).toBe('12.3457M');
    });
});
