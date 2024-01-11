import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import EventDiff from './EventDiff';

test('Show no changes', async () => {
    render(<EventDiff entry={{ preData: [], data: [] }} />);

    expect(screen.getByText('(no changes)')).toBeInTheDocument();
});

test('Show new data added diff', async () => {
    render(<EventDiff entry={{ preData: {}, data: { segments: [] } }} />);

    expect(screen.getByText('+ segments: []')).toBeInTheDocument();
});

test('Show new data removed diff', async () => {
    render(<EventDiff entry={{ preData: { segments: [] }, data: {} }} />);

    expect(screen.getByText('- segments (deleted)')).toBeInTheDocument();
});

test('Show new data changes diff', async () => {
    render(
        <EventDiff
            entry={{ preData: { segments: 'a' }, data: { segments: 'b' } }}
        />,
    );

    expect(screen.getByText('- segments: "a"')).toBeInTheDocument();
    expect(screen.getByText('+ segments: "b"')).toBeInTheDocument();
});

test('Show new data only', async () => {
    render(
        <EventDiff entry={{ preData: undefined, data: { segments: [] } }} />,
    );

    expect(screen.getByText('{ "segments": [] }')).toBeInTheDocument();
});

test('Show old data only', async () => {
    render(
        <EventDiff entry={{ preData: { segments: [] }, data: undefined }} />,
    );

    expect(screen.getByText('{ "segments": [] }')).toBeInTheDocument();
});
