import { createContext } from '@lit-labs/context';
import { AdminWebsocket, AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { TodoStore } from './todo-store';

export const appWebsocketContext = createContext<AppWebsocket>('appWebsocket');
export const adminWebsocketContext = createContext<AdminWebsocket>('adminWebsocket');
export const appInfoContext = createContext<InstalledAppInfo>('appInfo');
export const todoStoreContext = createContext<TodoStore>(
    'todo-store-context'
  );
