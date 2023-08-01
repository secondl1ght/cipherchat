import { writable, readable } from 'svelte/store';
import { lnc } from '$lib/lnc';
import { get } from 'svelte/store';

const generateInitialKeyType = async () =>
	await crypto.subtle.generateKey(
		{
			name: 'AES-GCM',
			length: 256
		},
		false,
		['encrypt', 'decrypt']
	);

export const connected = writable(false);
export const paired = writable(lnc.credentials.isPaired);
export const pubkey = writable('');
export const alias = writable('');
export const color = writable('');
export const initialKey = readable(await generateInitialKeyType());
export const cryptoKey = writable(get(initialKey));
