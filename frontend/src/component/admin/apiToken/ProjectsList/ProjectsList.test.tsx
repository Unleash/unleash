import React from 'react';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { ProjectsList } from 'component/admin/apiToken/ProjectsList/ProjectsList';

describe('ProjectsList', () => {
    it('should prioritize new "projects" array over deprecated "project"', async () => {
        render(
            <ProjectsList
                project="project"
                projects={['project1', 'project2']}
            />
        );

        const links = await screen.findAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveTextContent('project1');
        expect(links[1]).toHaveTextContent('project2');
        expect(links[0]).toHaveAttribute('href', '/projects/project1');
        expect(links[1]).toHaveAttribute('href', '/projects/project2');
    });

    it('should render correctly with single "project"', async () => {
        render(<ProjectsList project="project" />);

        const links = await screen.findAllByRole('link');
        expect(links).toHaveLength(1);
        expect(links[0]).toHaveTextContent('project');
    });

    it('should have comma between project links', async () => {
        const { container } = render(<ProjectsList projects={['a', 'b']} />);

        expect(container.textContent).toContain(', ');
    });

    it('should render asterisk if no projects are passed', async () => {
        const { container } = render(<ProjectsList />);

        expect(container.textContent).toEqual('*');
    });

    it('should render asterisk if empty projects array is passed', async () => {
        const { container } = render(<ProjectsList projects={[]} />);

        expect(container.textContent).toEqual('*');
    });
});
