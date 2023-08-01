import { Buffer } from 'buffer';

export const bufferUtfToHex = (value: string) => Buffer.from(value, 'utf8').toString('hex');
export const bufferUtfToBase64 = (value: string) => Buffer.from(value, 'utf8').toString('base64');
export const bufferBase64ToUtf = (value: string | Uint8Array) =>
	Buffer.from(value.toString(), 'base64').toString('utf8');
