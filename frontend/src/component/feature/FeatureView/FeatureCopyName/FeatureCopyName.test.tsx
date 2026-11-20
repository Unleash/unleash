import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FeatureCopyName } from './FeatureCopyName.tsx';

test('shows the copy shortcut on the copy button', () => {
    render(<FeatureCopyName name='my-flag' />);

    expect(
        screen.getByRole('button', { name: 'Copy name (Ctrl+C)' }),
    ).toBeInTheDocument();
});
