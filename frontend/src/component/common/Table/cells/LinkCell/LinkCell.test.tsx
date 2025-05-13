import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import userEvent from '@testing-library/user-event';
import { LinkCell } from './LinkCell.tsx';

describe('LinkCell Component', () => {
    it('renders the subtitle in an HtmlTooltip when length is greater than 40 characters', async () => {
        const longSubtitle =
            'This is a long subtitle that should trigger tooltip rendering.';
        render(<LinkCell title='Test Title' subtitle={longSubtitle} />);

        const subtitleElement = screen.getByText(longSubtitle);
        expect(subtitleElement).toBeInTheDocument();

        await userEvent.hover(subtitleElement);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent(longSubtitle);
    });
});
