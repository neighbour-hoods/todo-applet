import { createContext } from '@lit-labs/context';
import { AdminWebsocket, AppWebsocket, EntryHash, InstalledAppInfo } from '@holochain/client';
import { TodoStore } from './todo-store';
import { SensemakerStore } from '@lightningrodlabs/we-applet';
import { AppletConfig } from './types';

export const appWebsocketContext = createContext<AppWebsocket>('appWebsocket');
export const adminWebsocketContext = createContext<AdminWebsocket>('adminWebsocket');
export const appInfoContext = createContext<InstalledAppInfo>('appInfo');
export const todoStoreContext = createContext<TodoStore>(
    'todo-store-context'
);
export const sensemakerStoreContext = createContext<SensemakerStore>(
    'sensemaker-store-context'
);