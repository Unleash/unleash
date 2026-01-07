import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { ProjectsList } from './ProjectsList.tsx';

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

    it('should render "*" if no projects are passed', async () => {
        const { container } = render(<ProjectsList />);

        expect(container.textContent).toEqual('*');
    });

    it('should render "*" if empty projects array is passed', async () => {
        const { container } = render(<ProjectsList projects={[]} />);

        expect(container.textContent).toEqual('*');
    });

    it('should show the number of projects', async () => {
        const { container } = render(
            <ProjectsList
                projects={['project1', 'project2', 'project3', 'project4']}
            />,
        );

        expect(container.textContent).toContain('4 projects');
    });

    it('should render "*" if project is "*" and no projects are passed', async () => {
        const { container } = render(<ProjectsList project='*' />);

        expect(container.textContent).toEqual('*');
    });

    it('should render "*" if projects has only "*"', async () => {
        const { container } = render(<ProjectsList projects={['*']} />);

        expect(container.textContent).toEqual('*');
    });
});
