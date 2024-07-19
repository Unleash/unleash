import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    describe('orphaned tokens', () => {
        it('should show warning icon if it is an orphaned token', async () => {
            render(
                <ProjectsList
                    projects={[]}
                    secret='test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b'
                />,
            );

            const errorIcon = await screen.findByTestId('ErrorIcon');
            expect(errorIcon).toBeInTheDocument();
        });

        it('should show tooltip with warning message if it is an orphaned token', async () => {
            const user = userEvent.setup();
            render(
                <ProjectsList
                    projects={[]}
                    secret='test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b'
                />,
            );

            const errorIcon = await screen.findByTestId('ErrorIcon');
            user.hover(errorIcon);

            const tooltip = await screen.findByRole('tooltip');
            expect(tooltip).toHaveTextContent(/orphaned token/);
        });

        it('should not show warning icon if token is in v1 format', async () => {
            render(
                <ProjectsList
                    projects={[]}
                    secret='be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178'
                />,
            );

            const errorIcon = await screen.queryByTestId('ErrorIcon');
            expect(errorIcon).toBeNull();
        });

        it('should not show warning for wildcard tokens', async () => {
            render(
                <ProjectsList
                    projects={[]}
                    secret='*:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b'
                />,
            );

            const errorIcon = await screen.queryByTestId('ErrorIcon');
            expect(errorIcon).toBeNull();
        });
    });
});
