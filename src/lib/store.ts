import { lnc } from '$lib/lnc';
import { AppViewState, type Conversation, type MessageDecrypted } from '$lib/types';
import { readable, writable, type Writable } from 'svelte/store';

export const paired = writable(lnc.credentials.isPaired);
export const connected = writable(false);

export const cryptoKey: Writable<CryptoKey | undefined> = writable();

export const userPubkey = writable('');
export const userAlias = writable('');
export const userColor = writable('');
export const userAvatar = writable(localStorage.getItem('userAvatar'));

export const appView = writable(AppViewState.Home);
export const homeState: Writable<'HOME' | 'PROFILE' | 'ADD'> = writable('HOME');

export const conversations: Writable<Conversation[]> = writable();
export const addConvo: Writable<'' | 'LOADING' | 'SUCCESS'> = writable('');
export const activeConversation = writable('');

export const messages: Writable<MessageDecrypted[]> = writable();
export const messageHistory = writable(25);
export const lockMessage = writable(false);
export const clearMessage = writable(false);

export const links = readable({
	github: 'https://github.com/secondl1ght/cipherchat',
	twitter: '',
	nostr: '',
	matrix: '',
	rumble: ''
});

export const error = writable({ status: '', message: '' });
