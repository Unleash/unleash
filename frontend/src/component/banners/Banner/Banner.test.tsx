import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Banner } from './Banner.tsx';

test('should render correctly when using basic options', () => {
    render(
        <Banner
            banner={{
                message: 'This is a simple banner message.',
                variant: 'warning',
            }}
        />,
    );

    expect(
        screen.getByText('This is a simple banner message.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('WarningAmberIcon')).toBeInTheDocument();
});

test('should render correctly when using advanced options', async () => {
    render(
        <Banner
            banner={{
                message: 'This is a more advanced banner message.',
                variant: 'success',
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
        screen.getByText('This is a more advanced banner message.'),
    ).toBeInTheDocument();

    const link = screen.getByText('Click me');
    expect(link).toBeInTheDocument();
    link.click();

    expect(await screen.findByText('Dialog title')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
});

test('should default to info variant when an invalid variant is provided', () => {
    render(
        <Banner
            banner={{
                message: 'This defaulted to an info banner message.',
                // @ts-expect-error
                variant: 'invalid',
            }}
        />,
    );

    expect(
        screen.getByText('This defaulted to an info banner message.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
});
