import { writable, readable } from 'svelte/store';
import { lnc } from '$lib/lnc';

export const paired = writable(lnc.credentials.isPaired);
export const connected = writable(false);
export const cryptoKey = writable();
export const pubkey = writable('');
export const alias = writable('');
export const color = writable('');
export const TLV_RECORDS = readable({
	KEYSEND_PREIMAGE: 5482373484,
	SENDERS_PUBKEY: 34349339,
	TIMESTAMP: 34349343,
	MESSAGE_CONTENT: 34349334,
	SIGNATURE: 34349337,
	CONTENT_TYPE: 34349345
});
export const clearMessage = writable('');
export const links = readable({
	github: 'https://github.com/secondl1ght/cipherchat',
	twitter: '',
	nostr: '',
	matrix: '',
	rumble: ''
});
export const error = writable({ status: '', message: '' });
