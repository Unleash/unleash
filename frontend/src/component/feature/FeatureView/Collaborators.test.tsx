import { render } from '@testing-library/react';
import { Collaborators } from './Collaborators.tsx';

test('renders nothing if collaborators is undefined', () => {
    const { container } = render(<Collaborators collaborators={undefined} />);

    expect(container).toBeEmptyDOMElement();
});

test('renders nothing if users is empty', () => {
    const { container } = render(<Collaborators collaborators={[]} />);

    expect(container).toBeEmptyDOMElement();
});
