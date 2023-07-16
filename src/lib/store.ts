import { writable } from 'svelte/store';
import { lnc } from '$lib/lnc';

export const connected = writable(false);
export const paired = writable(lnc.credentials.isPaired);
