// adds the 'fetchMock' global variable and rewires 'fetch' global to call 'fetchMock' instead of the real implementation
require('jest-fetch-mock').enableMocks();
