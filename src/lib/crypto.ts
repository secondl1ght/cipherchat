import { cryptoKey, initialKey } from '$lib/store';
import { get } from 'svelte/store';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const randomBytes = (length: number) => crypto.getRandomValues(new Uint8Array(length));
export const createHash = async (data: ArrayBufferLike) =>
	await crypto.subtle.digest('SHA-256', data);

export const generateKey = async (password: string) => {
	const importedKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	);

	const salt = randomBytes(16);

	const derivedKey = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		importedKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);

	cryptoKey.set(derivedKey);
};

export const resetKey = () => {
	cryptoKey.set(get(initialKey));
};

export const encrypt = async (content: string) => {
	const encodedContent = encoder.encode(content);

	const iv = randomBytes(12);

	const encryptedContent = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		get(cryptoKey),
		encodedContent
	);

	return { content: encryptedContent, iv };
};

export const decrypt = async (iv: Uint8Array, ciphertext: ArrayBuffer) =>
	decoder.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, get(cryptoKey), ciphertext));
