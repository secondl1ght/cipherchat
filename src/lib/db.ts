import Dexie, { type Table } from 'dexie';

export enum MessageType {
	Text = 'TEXT',
	Image = 'IMAGE',
	Payment = 'PAYMENT'
}

export enum MessageStatus {
	Unknown = 'UNKNOWN',
	InFlight = 'IN_FLIGHT',
	Succeeded = 'SUCCEEDED',
	Failed = 'FAILED'
}

export enum FailureReason {
	None = 'FAILURE_REASON_NONE',
	Timeout = 'FAILURE_REASON_TIMEOUT',
	NoRoute = 'FAILURE_REASON_NO_ROUTE',
	Error = 'FAILURE_REASON_ERROR',
	IncorrectPaymentDetails = 'FAILURE_REASON_INCORRECT_PAYMENT_DETAILS',
	InsufficientBalance = 'FAILURE_REASON_INSUFFICIENT_BALANCE'
}

export interface Message {
	id: string;
	iv: Uint8Array;
	message: ArrayBuffer;
	signature: string;
	type: MessageType;
	timestamp: string;
	status: MessageStatus;
	amount: number;
	fee?: number;
	failureReason: FailureReason;
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
