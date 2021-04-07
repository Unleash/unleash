import '@testing-library/jest-dom'
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

process.env.TZ = 'UTC';
configure({ adapter: new Adapter() });
