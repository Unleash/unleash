import { render } from 'utils/testRenderer';
import { MultipleRoleSelect } from './MultipleRoleSelect';
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
                    name: 'My Custom Role',
                    project: null,
                    description: 'Custom role description',
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
    expect(screen.getByText('My Custom Role')).toBeInTheDocument();
    expect(screen.getByText('Custom role description')).toBeInTheDocument();
});
