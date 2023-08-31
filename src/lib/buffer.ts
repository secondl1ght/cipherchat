import { Buffer } from 'buffer';

export const bufferUtfToBase64 = (value: string) => Buffer.from(value, 'utf8').toString('base64');
export const bufferHexToBase64 = (value: string) => Buffer.from(value, 'hex').toString('base64');
export const bufferBase64ToUtf = (value: string | Uint8Array) =>
	Buffer.from(value.toString(), 'base64').toString('utf8');
export const bufferToBase64 = (value: ArrayBuffer | ArrayBufferLike) =>
	Buffer.from(value).toString('base64');
export const bufferBase64ToBuffer = (value: string) => Buffer.from(value, 'base64');
