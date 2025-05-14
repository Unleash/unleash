import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { vi } from 'vitest';
import { AvatarCell } from './AvatarCell.tsx';

test("the filtering button should have aria-disabled='true' when the user id is 0", async () => {
    const Cell = AvatarCell(() => {});
    render(<Cell row={{ original: { createdBy: { id: 0, name: '' } } }} />);
    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
});

test("the filtering button should have aria-disabled='false' when the user id is not 0", async () => {
    const Cell = AvatarCell(() => {});
    render(<Cell row={{ original: { createdBy: { id: 1, name: '' } } }} />);
    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'false');
});

test('the onAvatarClick function should not be called when the user id is 0', async () => {
    const onAvatarClick = vi.fn();
    const Cell = AvatarCell(onAvatarClick);
    render(<Cell row={{ original: { createdBy: { id: 0, name: '' } } }} />);
    const button = await screen.findByRole('button');

    fireEvent.click(button);

    expect(onAvatarClick).not.toHaveBeenCalled();
});

test('the onAvatarClick function should be called when the user id is not 0', async () => {
    const onAvatarClick = vi.fn();
    const Cell = AvatarCell(onAvatarClick);
    render(<Cell row={{ original: { createdBy: { id: 1, name: '' } } }} />);
    const button = await screen.findByRole('button');

    fireEvent.click(button);

    expect(onAvatarClick).toHaveBeenCalled();
});

test("when the user id is 0, the tooltip should tell you that you can't filter by unknown users", async () => {
    const Cell = AvatarCell(() => {});
    render(<Cell row={{ original: { createdBy: { id: 0, name: '' } } }} />);
    const button = await screen.findByRole('button');
    fireEvent.mouseOver(button);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent("can't filter by unknown users");
});

test("when the user id is not 0, the tooltip should not tell you that you can't filter by unknown users", async () => {
    const Cell = AvatarCell(() => {});
    render(<Cell row={{ original: { createdBy: { id: 1, name: '' } } }} />);
    const button = await screen.findByRole('button');
    fireEvent.mouseOver(button);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).not.toHaveTextContent("can't filter by unknown users");
});
