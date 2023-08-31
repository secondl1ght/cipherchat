import type { Conversation, Message } from '$lib/types';
import Dexie, { type Table } from 'dexie';

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
