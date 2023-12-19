import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Banner } from './Banner';

test('should render correctly when using basic options', () => {
    render(
        <Banner
            banner={{
                message: 'This is a banner message.',
            }}
        />,
    );

    expect(screen.getByText('This is a banner message.')).toBeInTheDocument();
});

test('should render correctly when using advanced options', () => {
    render(
        <Banner
            banner={{
                message: 'This is another banner message.',
                variant: 'info',
                sticky: false,
                icon: 'star',
                link: 'dialog',
                linkText: 'Click me',
                dialogTitle: 'Dialog title',
                dialog: 'Dialog content',
            }}
        />,
    );

    expect(
        screen.getByText('This is another banner message.'),
    ).toBeInTheDocument();

    const link = screen.getByText('Click me');
    expect(link).toBeInTheDocument();
    link.click();

    expect(screen.getByText('Dialog title')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
});

test('should default to info variant when an invalid variant is provided', () => {
    render(
        <Banner
            banner={{
                message: 'This is an info banner message.',
                // @ts-expect-error
                variant: 'invalid',
            }}
        />,
    );

    expect(
        screen.getByText('This is an info banner message.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
});
