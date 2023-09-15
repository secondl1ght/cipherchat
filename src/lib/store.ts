import { lnc } from '$lib/lnc';
import { AppViewState, type Conversation, type MessageDecrypted } from '$lib/types';
import { readable, writable, type Writable } from 'svelte/store';
import type { Instance } from 'tippy.js';

export const paired = writable(lnc.credentials.isPaired);
export const connected = writable(false);

export const cryptoKey: Writable<CryptoKey | undefined> = writable();

export const userPubkey = writable('');
export const userAlias = writable('');
export const userColor = writable('');
export const userAvatar = writable(localStorage.getItem('userAvatar'));

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
export const lockMessage = writable(false);
export const clearMessage = writable(false);
export const messageMemory: Writable<any> = writable({});
export const activeMenu: Writable<Instance | undefined> = writable();
export const activeMessage = writable('');
export const bubbleColor = writable(localStorage.getItem('bubbleColor'));
export const textColor = writable(localStorage.getItem('textColor'));

export const links = readable({
	github: 'https://github.com/secondl1ght/cipherchat',
	twitter: '',
	nostr: '',
	matrix: '',
	rumble: ''
});

export const innerWidth: Writable<number> = writable();
export const chatInput: Writable<HTMLTextAreaElement> = writable();
export const chatInputHeight: Writable<number> = writable();
export const scrollDiv: Writable<HTMLDivElement> = writable();
export const scrollDivPosition = writable(0);
export const homeScrollDiv: Writable<HTMLDivElement> = writable();

export const error = writable({ status: '', message: '' });
