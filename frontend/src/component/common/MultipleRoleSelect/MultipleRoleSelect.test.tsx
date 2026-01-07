import { render } from 'utils/testRenderer';
import { MultipleRoleSelect } from './MultipleRoleSelect.tsx';
import { fireEvent, screen } from '@testing-library/react';

test('Display grouped project roles with names and descriptions', async () => {
    render(
        <MultipleRoleSelect
            roles={[
                {
                    id: 0,
                    name: 'Owner',
                    project: null,
                    description: 'Owner description',
                    type: 'project',
                },
                {
                    id: 1,
                    name: 'B Custom Role',
                    project: null,
                    description: 'Custom role description A',
                    type: 'custom',
                },
                {
                    id: 2,
                    name: 'A Custom Role',
                    project: null,
                    description: 'Custom role description B',
                    type: 'custom',
                },
            ]}
            value={[]}
            setValue={() => {}}
        />,
    );

    const multiselect = await screen.findByLabelText('Role');

    fireEvent.click(multiselect);

    expect(screen.getByText('Predefined project roles')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Owner description')).toBeInTheDocument();
    expect(screen.getByText('Custom project roles')).toBeInTheDocument();
    const customRoleA = screen.getByText('A Custom Role');
    const customRoleB = screen.getByText('B Custom Role');
    expect(customRoleA).toBeInTheDocument();
    expect(customRoleB).toBeInTheDocument();
    expect(customRoleA.compareDocumentPosition(customRoleB)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText('Custom role description A')).toBeInTheDocument();
    expect(screen.getByText('Custom role description B')).toBeInTheDocument();
});
