import { FeedbackProvider } from './FeedbackProvider.tsx';
import { FeedbackSurvey } from './FeedbackSurvey.tsx';
import { identifyUser } from './identifyUser.ts';

const FeedbackModule = () => (
    <FeedbackProvider identifyUser={identifyUser}>
        <FeedbackSurvey />
    </FeedbackProvider>
);

export default FeedbackModule;
