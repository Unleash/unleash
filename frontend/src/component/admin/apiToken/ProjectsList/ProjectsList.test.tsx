import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { ProjectsList } from 'component/admin/apiToken/ProjectsList/ProjectsList';

describe('ProjectsList', () => {
    it('should prioritize new "projects" array over deprecated "project"', async () => {
        const { container } = render(
            <ProjectsList
                project='project'
                projects={['project1', 'project2']}
            />,
        );

        expect(container.textContent).toContain('2 projects');
    });

    it('should render correctly with single "project"', async () => {
        render(<ProjectsList project='project' />);

        const links = await screen.findAllByRole('link');
        expect(links).toHaveLength(1);
        expect(links[0]).toHaveTextContent('project');
    });

    it('should render asterisk if no projects are passed', async () => {
        const { container } = render(<ProjectsList />);

        expect(container.textContent).toEqual('*');
    });

    it('should render asterisk if empty projects array is passed', async () => {
        const { container } = render(<ProjectsList projects={[]} />);

        expect(container.textContent).toEqual('*');
    });

    it('should show number of projects', async () => {
        const { container } = render(
            <ProjectsList
                projects={['project1', 'project2', 'project3', 'project4']}
            />,
        );

        expect(container.textContent).toContain('4 projects');
    });
});
