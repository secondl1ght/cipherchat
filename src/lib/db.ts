import type { lnrpc } from '@lightninglabs/lnc-web';
import Dexie, { type Table } from 'dexie';

export interface Conversation {
	pubkey: string;
	alias?: string;
	color?: string;
	avatar?: string;
	read: boolean;
	blocked: 'true' | 'false';
	charLimit: number;
	latestMessage?: string;
	lastUpdate?: number;
}

export enum MessageType {
	Text = 'TEXT',
	Image = 'IMAGE',
	Payment = 'PAYMENT'
}

export interface Message {
	id: string;
	pubkey: string;
	iv: Uint8Array;
	message: ArrayBuffer;
	signature?: string;
	type: MessageType;
	timestamp: number;
	receivedTime: number;
	status: lnrpc.Payment_PaymentStatus;
	amount: number;
	fee?: number;
	failureReason: lnrpc.PaymentFailureReason;
	self: boolean;
}

export class MySubClassedDexie extends Dexie {
	conversations!: Table<Conversation>;
	messages!: Table<Message>;

	constructor() {
		super('CipherchatDB');
		this.version(1).stores({
			conversations: '&pubkey, blocked', // Primary key and indexed props
			messages: '&id, pubkey' // Primary key and indexed props
		});
	}
}

export const db = new MySubClassedDexie();
