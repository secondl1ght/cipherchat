import { AppViewState, type Conversation, type MessageDecrypted } from '$lib/types';
import { monthAgo } from '$lib/utils';
import type LNC from '@lightninglabs/lnc-web';
import type { lnrpc } from '@lightninglabs/lnc-web';
import { readable, writable, type Writable } from 'svelte/store';
import type { Instance } from 'tippy.js';

export const lnc: Writable<LNC> = writable();
export const LNRPC: Writable<typeof lnrpc> = writable();

export const serviceWorkerAvailable = writable(false);
export const webAssemblyAvailable = writable(false);
export const localStorageAvailable = writable(false);
export const indexedDBAvailable = writable(false);

export const updatesAvailable = writable(false);

export const firstUpdate = writable(monthAgo());

export const paired = writable(false);
export const connected = writable(false);
export const offline = writable(false);

export const cryptoKey: Writable<CryptoKey | undefined> = writable();

export const userPubkey = writable('');
export const userAlias = writable('');
export const userColor = writable('');
export const userAvatar: Writable<string | null> = writable();

export const appView = writable(AppViewState.Home);
export const homeState: Writable<'HOME' | 'PROFILE' | 'ADD' | 'SETTINGS'> = writable('HOME');
export const convoState: Writable<'CHAT' | 'NODE' | 'MESSAGE'> = writable('CHAT');

export const conversations: Writable<Conversation[]> = writable([]);
export const activeConversation = writable('');
export const conversation: Writable<Conversation> = writable();
export const conversationLoading = writable(false);

export const messages: Writable<MessageDecrypted[]> = writable([]);
export const messageHistory = writable(25);
export const messagesLoading = writable(false);
export const sendLoading = writable(false);
export const messageMemory: Writable<any> = writable({});
export const activeMenu: Writable<Instance | undefined> = writable();
export const activeMessage = writable('');
export const bubbleColorOne: Writable<string | null> = writable();
export const bubbleColorTwo: Writable<string | null> = writable();
export const textColorOne: Writable<string | null> = writable();
export const textColorTwo: Writable<string | null> = writable();

export const links = readable({
	GitHub: 'https://github.com/secondl1ght/cipherchat',
	X: '',
	Telegram: '',
	Rumble: ''
});

export const innerWidth: Writable<number> = writable();
export const chatInput: Writable<HTMLTextAreaElement> = writable();
export const chatInputHeight: Writable<number> = writable();
export const scrollDiv: Writable<HTMLDivElement> = writable();
export const scrollDivPosition: Writable<number | undefined> = writable();
export const showScrollButton = writable(false);
export const scrollBottom: Writable<HTMLSpanElement> = writable();
export const homeScrollDiv: Writable<HTMLDivElement> = writable();
export const scanActive = writable(false);

export const sharePubkey = writable('');

export const error = writable({ status: '', message: '' });
