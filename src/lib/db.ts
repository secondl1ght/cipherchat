import type { lnrpc } from '@lightninglabs/lnc-web';
import Dexie, { type Table } from 'dexie';

export enum MessageType {
	Text = 'TEXT',
	Image = 'IMAGE',
	Payment = 'PAYMENT'
}

export interface Message {
	id: string;
	iv: Uint8Array;
	message: ArrayBuffer;
	signature: string;
	type: MessageType;
	timestamp: number;
	status: lnrpc.Payment_PaymentStatus;
	amount: number;
	fee?: number;
	failureReason: lnrpc.PaymentFailureReason;
	self: boolean;
}

export interface Conversation {
	pubkey: string;
	alias?: string;
	color?: string;
	avatar: string;
	messages?: Message[];
	read: boolean;
	blocked: boolean;
	charLimit: number;
}

export class MySubClassedDexie extends Dexie {
	conversations!: Table<Conversation>;

	constructor() {
		super('CipherchatDB');
		this.version(1).stores({
			conversations: '&pubkey blocked' // Primary key and indexed props
		});
	}
}

export const db = new MySubClassedDexie();
