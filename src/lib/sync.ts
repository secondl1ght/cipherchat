import { bufferBase64ToUtf, bufferUtfToBase64 } from '$lib/buffer';
import { encrypt } from '$lib/crypto';
import { db } from '$lib/db';
import { firstUpdate, lnc as lncStore, LNRPC as lnrpcStore, userPubkey } from '$lib/store';
import { TLV_RECORDS } from '$lib/tlv';
import {
	MessageType,
	type Conversation,
	type ConversationConstruction,
	type Message
} from '$lib/types';
import { getUpdateTime, setFirstSyncComplete, setLastUpdate, warningToast } from '$lib/utils';
import type LNC from '@lightninglabs/lnc-web';
import type { lnrpc } from '@lightninglabs/lnc-web';
import { get } from 'svelte/store';

let lnc: LNC;
let LNRPC: typeof lnrpc;

lncStore.subscribe((value) => (lnc = value));
lnrpcStore.subscribe((value) => (LNRPC = value));

let updateTime: string;

const { KEYSEND_PREIMAGE, SENDERS_PUBKEY, TIMESTAMP, MESSAGE_CONTENT, SIGNATURE, CONTENT_TYPE } =
	TLV_RECORDS;

const messageType = Object.values(MessageType);

export const validateInvoice = async (invoice: lnrpc.Invoice) => {
	const successfulHTLC = invoice.htlcs.find((htlc) => htlc.state === 'SETTLED');

	if (!successfulHTLC) return false;

	const preimage = successfulHTLC.customRecords[KEYSEND_PREIMAGE];
	const timestamp = successfulHTLC.customRecords[TIMESTAMP];
	const message = successfulHTLC.customRecords[MESSAGE_CONTENT];
	const signature = successfulHTLC.customRecords[SIGNATURE];
	const pubkey = successfulHTLC.customRecords[SENDERS_PUBKEY];
	const type = successfulHTLC.customRecords[CONTENT_TYPE];

	if (!invoice.isKeysend || !message) {
		return false;
	}

	if (
		!preimage ||
		!timestamp ||
		!signature ||
		!pubkey ||
		!type ||
		bufferBase64ToUtf(pubkey) === get(userPubkey)
	) {
		return 'ANON';
	}

	try {
		const messageFormatted = bufferUtfToBase64(
			get(userPubkey) + bufferBase64ToUtf(timestamp) + bufferBase64ToUtf(message)
		);
		const pubkeyDecoded = bufferBase64ToUtf(pubkey);

		const verifySignature = await lnc.lnd.lightning.verifyMessage({
			msg: messageFormatted,
			signature: signature.toString()
		});

		if (verifySignature.valid && verifySignature.pubkey === pubkeyDecoded) {
			return true;
		} else {
			return 'ANON';
		}
	} catch (error) {
		console.log(error);
		return 'ANON';
	}
};

const anonInvoicesFormatted: Message[] = [];

export const initializeInvoices = async () => {
	const lastUpdate =
		localStorage.getItem('lastUpdate') || (Date.parse(get(firstUpdate)) / 1000).toString();

	updateTime = getUpdateTime();

	const { invoices } = await lnc.lnd.lightning.listInvoices({
		creationDateStart: lastUpdate,
		numMaxInvoices: '21000000'
	});

	if (!invoices.length) return;

	const invoicesFiltered: lnrpc.Invoice[] = [];
	const anonInvoices: lnrpc.Invoice[] = [];

	for await (const invoice of invoices) {
		const validated = await validateInvoice(invoice);

		if (validated === true) {
			invoicesFiltered.push(invoice);
		} else if (validated === 'ANON') {
			anonInvoices.push(invoice);
		}
	}

	const invoicesGrouped: ConversationConstruction[] = [];

	for await (const invoice of invoicesFiltered) {
		const successfulHTLC = invoice.htlcs.find((htlc) => htlc.state === 'SETTLED');

		if (!successfulHTLC) return;

		try {
			// conversation values
			const pubkey = bufferBase64ToUtf(successfulHTLC.customRecords[SENDERS_PUBKEY]);
			const unread = 1;
			const blocked = 'false';
			const bookmarked = 'false';
			const charLimit = 300;

			// message values
			const preimage = successfulHTLC.customRecords[KEYSEND_PREIMAGE].toString();
			const message = bufferBase64ToUtf(successfulHTLC.customRecords[MESSAGE_CONTENT]);
			const messageEncrypted = await encrypt(message);
			if (!messageEncrypted) return;
			const signature = successfulHTLC.customRecords[SIGNATURE].toString();
			const type = messageType.find(
				(type) => type === bufferBase64ToUtf(successfulHTLC.customRecords[CONTENT_TYPE])
			);
			if (!type) return;
			const timestamp = Number(bufferBase64ToUtf(successfulHTLC.customRecords[TIMESTAMP]));
			const receivedTime = Number(invoice.settleDate) * 1000000000;
			const status = LNRPC.Payment_PaymentStatus.SUCCEEDED;
			const amount = Number(invoice.amtPaidSat);
			const failureReason = LNRPC.PaymentFailureReason.FAILURE_REASON_NONE;
			const self = false;

			const messageObject: Message = {
				id: preimage,
				pubkey,
				iv: messageEncrypted.iv,
				message: messageEncrypted.content,
				signature,
				type,
				timestamp,
				receivedTime,
				status,
				amount,
				failureReason,
				self
			};

			const index = invoicesGrouped.findIndex(
				(conversation: ConversationConstruction) => conversation.pubkey === pubkey
			);

			if (index !== -1) {
				invoicesGrouped[index].messages.push(messageObject);
				invoicesGrouped[index].unread++;
			} else {
				invoicesGrouped.push({
					pubkey,
					messages: [messageObject],
					unread,
					blocked,
					bookmarked,
					charLimit
				});
			}
		} catch (error) {
			console.log(error);
			return;
		}
	}

	if (anonInvoices.length) {
		for await (const invoice of anonInvoices) {
			const successfulHTLC = invoice.htlcs.find((htlc) => htlc.state === 'SETTLED');

			if (!successfulHTLC) return;

			try {
				// message values
				const preimage = invoice.rPreimage.toString();
				const pubkey = 'ANON';
				const message = bufferBase64ToUtf(successfulHTLC.customRecords[MESSAGE_CONTENT]);
				const messageEncrypted = await encrypt(message);
				if (!messageEncrypted) return;
				const type = MessageType.Text;
				const timestamp = Number(invoice.creationDate) * 1000000000;
				const receivedTime = Number(invoice.settleDate) * 1000000000;
				const status = LNRPC.Payment_PaymentStatus.SUCCEEDED;
				const amount = Number(invoice.amtPaidSat);
				const failureReason = LNRPC.PaymentFailureReason.FAILURE_REASON_NONE;
				const self = false;

				const messageObject: Message = {
					id: preimage,
					pubkey,
					iv: messageEncrypted.iv,
					message: messageEncrypted.content,
					type,
					timestamp,
					receivedTime,
					status,
					amount,
					failureReason,
					self
				};

				anonInvoicesFormatted.push(messageObject);
			} catch (error) {
				console.log(error);
				return;
			}
		}

		anonInvoicesFormatted.sort((a, b) => a.receivedTime - b.receivedTime);
	}

	return invoicesGrouped;
};

export const initializePayments = async () => {
	const lastUpdate =
		localStorage.getItem('lastUpdate') || (Date.parse(get(firstUpdate)) / 1000).toString();

	const { payments } = await lnc.lnd.lightning.listPayments({
		includeIncomplete: false,
		creationDateStart: lastUpdate,
		maxPayments: '21000000'
	});

	if (!payments.length) return;

	const paymentsFiltered = payments.filter((payment) => {
		const successfulHTLC = payment.htlcs.find((htlc) => htlc.status === 'SUCCEEDED')?.route?.hops;

		if (!successfulHTLC) return false;

		const lastRouteHop = successfulHTLC[successfulHTLC.length - 1];

		if (!lastRouteHop) return false;

		const preimage = lastRouteHop.customRecords[KEYSEND_PREIMAGE];
		const timestamp = lastRouteHop.customRecords[TIMESTAMP];
		const message = lastRouteHop.customRecords[MESSAGE_CONTENT];
		const signature = lastRouteHop.customRecords[SIGNATURE];
		const pubkey = lastRouteHop.customRecords[SENDERS_PUBKEY];
		const type = lastRouteHop.customRecords[CONTENT_TYPE];

		if (!preimage || !timestamp || !message || !signature || !pubkey || !type) {
			return false;
		} else {
			return true;
		}
	});

	const paymentsGrouped: ConversationConstruction[] = [];

	for await (const payment of paymentsFiltered) {
		const successfulHTLC = payment.htlcs.find((htlc) => htlc.status === 'SUCCEEDED')?.route?.hops;

		if (!successfulHTLC) return;

		const lastRouteHop = successfulHTLC[successfulHTLC.length - 1];

		if (!lastRouteHop) return;

		try {
			// conversation values
			const pubkey = lastRouteHop.pubKey;
			if (lastRouteHop.pubKey === get(userPubkey)) return;
			const unread = 0;
			const blocked = 'false';
			const bookmarked = 'false';
			const charLimit = 300;

			// message values
			const preimage = lastRouteHop.customRecords[KEYSEND_PREIMAGE].toString();
			const message = bufferBase64ToUtf(lastRouteHop.customRecords[MESSAGE_CONTENT]);
			const messageEncrypted = await encrypt(message);
			if (!messageEncrypted) return;
			const signature = lastRouteHop.customRecords[SIGNATURE].toString();
			const type = messageType.find(
				(type) => type === bufferBase64ToUtf(lastRouteHop.customRecords[CONTENT_TYPE])
			);
			if (!type) return;
			const timestamp = Number(bufferBase64ToUtf(lastRouteHop.customRecords[TIMESTAMP]));
			const status = payment.status;
			const amount = Number(payment.valueSat);
			const fee = Number(payment.feeSat);
			const failureReason = payment.failureReason;
			const self = true;

			const messageObject: Message = {
				id: preimage,
				pubkey,
				iv: messageEncrypted.iv,
				message: messageEncrypted.content,
				signature,
				type,
				timestamp,
				receivedTime: timestamp,
				status,
				amount,
				fee,
				failureReason,
				self
			};

			const index = paymentsGrouped.findIndex(
				(conversation: ConversationConstruction) => conversation.pubkey === pubkey
			);

			if (index !== -1) {
				paymentsGrouped[index].messages.push(messageObject);
			} else {
				paymentsGrouped.push({
					pubkey,
					messages: [messageObject],
					unread,
					blocked,
					bookmarked,
					charLimit
				});
			}
		} catch (error) {
			console.log(error);
			return;
		}
	}

	return paymentsGrouped;
};

export const combineConversations = (
	invoices: ConversationConstruction[],
	payments: ConversationConstruction[]
) => {
	const conversations = [...invoices];

	payments.forEach((payment) => {
		const index = conversations.findIndex((conversation) => conversation.pubkey === payment.pubkey);

		if (index !== -1) {
			const messages = conversations[index].messages.concat(payment.messages);

			conversations[index].messages = messages;
		} else {
			conversations.push(payment);
		}
	});

	return conversations;
};

export const finalizeConversations = async (conversations: ConversationConstruction[]) => {
	for await (const conversation of conversations) {
		conversation.messages.sort((a, b) => a.receivedTime - b.receivedTime);

		try {
			const nodeInfo = await lnc.lnd.lightning.getNodeInfo({
				pubKey: conversation.pubkey,
				includeChannels: false
			});

			conversation.alias = nodeInfo.node?.alias;
			conversation.color = nodeInfo.node?.color;
		} catch (error) {
			console.log(error);
		}

		const lastMessage = conversation.messages[conversation.messages.length - 1];

		conversation.latestMessage = lastMessage.id;
		conversation.latestMessageStatus = lastMessage.status;
		conversation.lastUpdate = lastMessage.receivedTime;
	}

	return conversations;
};

export const saveToDB = async (conversations: ConversationConstruction[]) => {
	const firstSyncComplete = localStorage.getItem('firstSyncComplete');

	const messages: Message[] = [];
	conversations.forEach((conversation) =>
		conversation.messages.forEach((message) => messages.push(message))
	);

	const conversationsFormatted: Conversation[] = conversations.map((conversation) => ({
		pubkey: conversation.pubkey,
		alias: conversation.alias,
		color: conversation.color,
		unread: conversation.unread,
		blocked: conversation.blocked,
		bookmarked: conversation.bookmarked,
		charLimit: conversation.charLimit,
		latestMessage: conversation.latestMessage,
		latestMessageStatus: conversation.latestMessageStatus,
		lastUpdate: conversation.lastUpdate
	}));

	if (anonInvoicesFormatted.length) {
		const lastMessage = anonInvoicesFormatted[anonInvoicesFormatted.length - 1];

		conversationsFormatted.push({
			pubkey: 'ANON',
			alias: 'Anonymous',
			color: '#5A7FFF',
			unread: anonInvoicesFormatted.length,
			blocked: 'false',
			bookmarked: 'false',
			charLimit: 300,
			latestMessage: lastMessage.id,
			latestMessageStatus: lastMessage.status,
			lastUpdate: lastMessage.receivedTime
		});
	}

	if (firstSyncComplete) {
		const primaryKeys = conversationsFormatted.map((conversation) => conversation.pubkey);

		await db.transaction('rw', db.conversations, db.messages, async () => {
			const recordsInDB = await db.conversations.bulkGet(primaryKeys);

			for await (const conversation of conversationsFormatted) {
				const recordExists = recordsInDB.find((record) => record?.pubkey === conversation.pubkey);

				if (recordExists) {
					recordExists.alias = conversation.alias;
					recordExists.color = conversation.color;
					recordExists.unread = recordExists.unread + conversation.unread;
					recordExists.latestMessage = conversation.latestMessage;
					recordExists.latestMessageStatus = conversation.latestMessageStatus;
					recordExists.lastUpdate = conversation.lastUpdate;

					await db.conversations.put(recordExists);
				} else {
					await db.conversations.add(conversation);
				}
			}

			await db.messages.bulkAdd(messages, undefined, { allKeys: false });
			if (anonInvoicesFormatted.length) {
				await db.messages.bulkAdd(anonInvoicesFormatted, undefined, { allKeys: false });
			}
		});

		setLastUpdate(updateTime);
	} else {
		await db.transaction('rw', db.conversations, db.messages, async () => {
			await db.conversations.bulkAdd(conversationsFormatted, undefined, { allKeys: false });
			await db.messages.bulkAdd(messages, undefined, { allKeys: false });
			if (anonInvoicesFormatted.length) {
				await db.messages.bulkAdd(anonInvoicesFormatted, undefined, { allKeys: false });
			}
		});

		setLastUpdate(updateTime);
		setFirstSyncComplete();
	}
};

export const fixPendingMessages = () => {
	try {
		db.transaction('rw', db.messages, db.conversations, () => {
			db.messages
				.where('status')
				.equals(LNRPC.Payment_PaymentStatus.IN_FLIGHT)
				.modify({ status: LNRPC.Payment_PaymentStatus.UNKNOWN });

			db.conversations
				.where('latestMessageStatus')
				.equals(LNRPC.Payment_PaymentStatus.IN_FLIGHT)
				.modify({ latestMessageStatus: LNRPC.Payment_PaymentStatus.UNKNOWN });
		});
	} catch (error) {
		console.log(error);
		warningToast('Could not fix unknown message status.');
	}
};
