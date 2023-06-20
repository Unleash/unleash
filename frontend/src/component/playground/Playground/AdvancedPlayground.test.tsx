import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';
import AdvancedPlayground from './AdvancedPlayground';
import { createLocalStorage } from '../../../utils/createLocalStorage';

test('should fetch form data from local storage', async () => {
    const { setValue } = createLocalStorage('AdvancedPlayground:v1', {});
    setValue({
        projects: ['projectA', 'projectB'],
        environments: ['development', 'production'],
        context: { userId: '1' },
    });

    render(
        <UIProviderContainer>
            <AdvancedPlayground
                FormComponent={props => (
                    <div>
                        <div data-id="projects">
                            {JSON.stringify(props.projects)}
                        </div>
                        <div data-id="environments">
                            {JSON.stringify(props.environments)}
                        </div>
                        <div data-id="context">
                            {JSON.stringify(props.context)}
                        </div>
                    </div>
                )}
            />
        </UIProviderContainer>
    );

    expect(screen.getByText('Unleash playground')).toBeInTheDocument();
    expect(screen.getByText('["projectA","projectB"]')).toBeInTheDocument();
    expect(
        screen.getByText('["development","production"]')
    ).toBeInTheDocument();
    expect(screen.getByText('{"userId":"1"}')).toBeInTheDocument();
});
