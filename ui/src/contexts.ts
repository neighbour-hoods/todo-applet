import { createContext } from '@lit-labs/context';
import { AdminWebsocket, AppWebsocket, EntryHash, AppInfo } from '@holochain/client';
import { TodoStore } from './todo-store';
import { SensemakerStore } from '@neighbourhoods/nh-we-applet';

export const appWebsocketContext = createContext<AppWebsocket>('appWebsocket');
export const adminWebsocketContext = createContext<AdminWebsocket>('adminWebsocket');
export const appInfoContext = createContext<AppInfo>('appInfo');
export const todoStoreContext = createContext<TodoStore>(
    'todo-store-context'
);
export const sensemakerStoreContext = createContext<SensemakerStore>(
    'sensemaker-store-context'
);