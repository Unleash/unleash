import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { EventDiff } from './EventDiff.tsx';

test('Show no changes', async () => {
    const { container } = render(
        <EventDiff entry={{ preData: [{ a: 'b' }], data: [{ a: 'b' }] }} />,
    );
    const diff = container.querySelector('.diff');
    expect(diff).toBeEmptyDOMElement();
});

test('Show new data added diff', async () => {
    render(<EventDiff entry={{ preData: {}, data: { segments: [] } }} />);

    const element = await screen.findByText(/segments:.*/);
    expect(element).toHaveClass('addition');
});

test('Show new data removed diff', async () => {
    render(<EventDiff entry={{ preData: { segments: [] }, data: {} }} />);

    const element = await screen.findByText(/segments:.*/);
    expect(element).toHaveClass('deletion');
});

test('Show new data changes diff', async () => {
    render(
        <EventDiff
            entry={{ preData: { segments: 'a' }, data: { segments: 'b' } }}
        />,
    );

    const deleted = await screen.findByText(/segments: "a".*/);
    expect(deleted).toHaveClass('deletion');
    const added = await screen.findByText(/segments: "b".*/);
    expect(added).toHaveClass('addition');
});

test('Show new data only', async () => {
    render(
        <EventDiff entry={{ preData: undefined, data: { segments: [] } }} />,
    );

    const element = await screen.findByText(/segments:.*/);
    expect(element).toHaveClass('addition');
});

test('Show old data only', async () => {
    render(
        <EventDiff entry={{ preData: { segments: [] }, data: undefined }} />,
    );

    const element = await screen.findByText(/segments:.*/);
    expect(element).toHaveClass('deletion');
});
