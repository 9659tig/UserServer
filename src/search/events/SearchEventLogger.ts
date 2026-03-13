import { SearchEvent } from '../types';

export interface SearchEventEmitter {
  emit(event: SearchEvent): void;
}

export class ConsoleSearchEventLogger implements SearchEventEmitter {
  emit(event: SearchEvent): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[SearchEvent]', JSON.stringify(event));
    }
  }
}
