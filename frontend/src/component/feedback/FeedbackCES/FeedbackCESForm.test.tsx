import { ThemeProvider } from '@material-ui/core';
import renderer from 'react-test-renderer';
import { FeedbackCESForm } from './FeedbackCESForm';
import mainTheme from 'themes/mainTheme';

test('FeedbackCESForm', () => {
    const onClose = () => {
        throw new Error('Unexpected onClose call.');
    };

    const tree = renderer.create(
        <ThemeProvider theme={mainTheme}>
            <FeedbackCESForm
                onClose={onClose}
                state={{ title: 'a', text: 'b', path: '/c' }}
            />
        </ThemeProvider>
    );

    expect(tree).toMatchSnapshot();
});
