import { FeedbackCESForm } from './FeedbackCESForm';
import { ThemeProvider } from 'themes/ThemeProvider';
import { render } from 'utils/testRenderer';

test('FeedbackCESForm', () => {
    const onClose = () => {
        throw new Error('Unexpected onClose call.');
    };

    render(
        <ThemeProvider>
            <FeedbackCESForm
                onClose={onClose}
                state={{ title: 'a', text: 'b', path: '/c' }}
            />
        </ThemeProvider>
    );

    expect(document.body).toMatchSnapshot();
});
