import { writable } from 'svelte/store';
import { lnc } from '$lib/lnc';

export const connected = writable(false);
export const paired = writable(lnc.credentials.isPaired);
export const pubkey = writable('');
export const alias = writable('');
export const color = writable('');
