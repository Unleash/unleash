import { createContext } from 'react';
import type { FlightRecorder } from '@unleash/sdk-flight-recorder';

export const FlightRecorderContext = createContext<FlightRecorder | null>(null);
