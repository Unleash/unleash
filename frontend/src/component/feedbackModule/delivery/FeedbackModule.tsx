import { FeedbackProvider } from './FeedbackProvider.tsx';
import { FeedbackSurvey } from './FeedbackSurvey.tsx';

const FeedbackModule = () => (
    <FeedbackProvider>
        <FeedbackSurvey />
    </FeedbackProvider>
);

export default FeedbackModule;
