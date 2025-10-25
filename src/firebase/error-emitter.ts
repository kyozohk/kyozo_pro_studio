import { EventEmitter } from 'events';
import { type FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class AppEventEmitter extends EventEmitter {
  emit<E extends keyof AppEvents>(event: E, ...args: Parameters<AppEvents[E]>) {
    return super.emit(event, ...args);
  }

  on<E extends keyof AppEvents>(event: E, listener: AppEvents[E]) {
    return super.on(event, listener);
  }
}

export const errorEmitter = new AppEventEmitter();
