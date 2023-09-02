import type { lnrpc } from '@lightninglabs/lnc-web';

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

export interface ConversationConstruction extends Conversation {
	messages: Message[];
}

export enum MessageType {
	Text = 'TEXT',
	Image = 'IMAGE',
	Payment = 'PAYMENT'
}

export type Message = {
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
};

export type MessageDecrypted = Omit<Message, 'message'> & { message: string };

export enum AppViewState {
	Home = 'HOME',
	Convo = 'CONVO'
}
