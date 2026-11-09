import {
    createEvent,
    fireEvent,
    screen,
    waitFor,
} from '@testing-library/react';
import { Link } from '@mui/material';
import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { HelpIcon } from './HelpIcon.tsx';

test('keeps HTML tooltip links interactive when leaving the help icon', async () => {
    const onClick = vi.fn();
    render(
        <HelpIcon
            htmlTooltip
            tooltip={
                <Link
                    href='https://docs.getunleash.io/'
                    target='_blank'
                    onClick={onClick}
                >
                    Read the docs
                </Link>
            }
        />,
    );

    const helpIcon = screen.getByLabelText('Help');
    fireEvent.mouseOver(helpIcon);
    const link = await screen.findByRole('link', { name: 'Read the docs' });

    fireEvent.mouseLeave(helpIcon);
    fireEvent.mouseOver(link);
    const mouseDown = createEvent.mouseDown(link);
    fireEvent(link, mouseDown);
    fireEvent.click(link);

    expect(mouseDown.defaultPrevented).toBe(true);
    expect(onClick).toHaveBeenCalledOnce();

    const middleMouseDown = createEvent.mouseDown(link, { button: 1 });
    fireEvent(link, middleMouseDown);
    expect(middleMouseDown.defaultPrevented).toBe(false);

    fireEvent.mouseLeave(screen.getByRole('tooltip'));
    await waitFor(() => {
        expect(
            screen.queryByRole('link', { name: 'Read the docs' }),
        ).not.toBeInTheDocument();
    });
});
