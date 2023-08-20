import { lnc } from '$lib/lnc';
import { readable, writable } from 'svelte/store';

export const paired = writable(lnc.credentials.isPaired);
export const connected = writable(false);
export const cryptoKey = writable();
export const userPubkey = writable('');
export const userAlias = writable('');
export const userColor = writable('');
export const addConvo = writable('');
export const activeConversation = writable('');
export const lockMessage = writable('');
export const clearMessage = writable('');
export const links = readable({
	github: 'https://github.com/secondl1ght/cipherchat',
	twitter: '',
	nostr: '',
	matrix: '',
	rumble: ''
});
export const error = writable({ status: '', message: '' });
