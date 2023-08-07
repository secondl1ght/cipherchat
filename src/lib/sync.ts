import { pubkey, TLV_RECORDS } from '$lib/store';
import { get } from 'svelte/store';
import { lnc } from '$lib/lnc';
import { bufferUtfToBase64, bufferBase64ToUtf } from '$lib/buffer';
import { type Conversation, type Message, MessageType } from '$lib/db';
import { encrypt } from '$lib/crypto';
import { lnrpc } from '@lightninglabs/lnc-web';
import { db } from '$lib/db';
import { getUpdateTime, setLastUpdate, setFirstSyncComplete } from '$lib/utils';
import { error } from '@sveltejs/kit';

let updateTime: string;

const { KEYSEND_PREIMAGE, SENDERS_PUBKEY, TIMESTAMP, MESSAGE_CONTENT, SIGNATURE, CONTENT_TYPE } =
	get(TLV_RECORDS);

const userPubkey = get(pubkey);
const messageType = Object.values(MessageType);

export const initializeInvoices = async () => {
	const lastUpdate = localStorage.getItem('lastUpdate') || undefined;

	updateTime = getUpdateTime();

	const { invoices } = await lnc.lnd.lightning.listInvoices({
		creationDateStart: lastUpdate
	});

	if (!invoices.length) return;

	const validateInvoice = async (invoice: lnrpc.Invoice) => {
		const successfulHTLC = invoice.htlcs.find((htlc) => htlc.state === 'SETTLED');

		if (!successfulHTLC) return false;

		const preimage = successfulHTLC.customRecords[KEYSEND_PREIMAGE];
		const timestamp = successfulHTLC.customRecords[TIMESTAMP];
		const message = successfulHTLC.customRecords[MESSAGE_CONTENT];
		const signature = successfulHTLC.customRecords[SIGNATURE];
		const pubkey = successfulHTLC.customRecords[SENDERS_PUBKEY];
		const type = successfulHTLC.customRecords[CONTENT_TYPE];

		if (
			!invoice.isKeysend ||
			!preimage ||
			!timestamp ||
			!message ||
			!signature ||
			!pubkey ||
			!type ||
			bufferBase64ToUtf(pubkey) === userPubkey
		) {
			return false;
		}

		try {
			const messageFormatted = bufferUtfToBase64(
				userPubkey + bufferBase64ToUtf(timestamp) + bufferBase64ToUtf(message)
			);
			const signatureDecoded = bufferBase64ToUtf(signature);
			const pubkeyDecoded = bufferBase64ToUtf(pubkey);

			const verifySignature = await lnc.lnd.lightning.verifyMessage({
				msg: messageFormatted,
				signature: signatureDecoded
			});

			if (verifySignature.valid && verifySignature.pubkey === pubkeyDecoded) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.log(error);
			return false;
		}
	};

	const invoicesFiltered: lnrpc.Invoice[] = [];

	for await (const invoice of invoices) {
		const validated = await validateInvoice(invoice);

		if (validated) {
			invoicesFiltered.push(invoice);
		}
	}

	const invoicesGrouped: Conversation[] = [];

	for await (const invoice of invoicesFiltered) {
		const successfulHTLC = invoice.htlcs.find((htlc) => htlc.state === 'SETTLED');

		if (!successfulHTLC) return;

		try {
			// conversation values
			const pubkey = bufferBase64ToUtf(successfulHTLC.customRecords[SENDERS_PUBKEY]);
			const avatar = '';
			const read = false;
			const blocked = 'false';
			const charLimit = 300;

			// message values
			const preimage = successfulHTLC.customRecords[KEYSEND_PREIMAGE].toString();
			const message = bufferBase64ToUtf(successfulHTLC.customRecords[MESSAGE_CONTENT]);
			const messageEncrypted = await encrypt(message);
			if (!messageEncrypted) return;
			const signature = bufferBase64ToUtf(successfulHTLC.customRecords[SIGNATURE]);
			const type = messageType.find(
				(type) => type === bufferBase64ToUtf(successfulHTLC.customRecords[CONTENT_TYPE])
			);
			if (!type) return;
			const timestamp = Number(bufferBase64ToUtf(successfulHTLC.customRecords[TIMESTAMP]));
			const status = lnrpc.Payment_PaymentStatus.SUCCEEDED;
			const amount = Number(invoice.amtPaidSat);
			const failureReason = lnrpc.PaymentFailureReason.FAILURE_REASON_NONE;
			const self = false;

			const messageObject: Message = {
				id: preimage,
				iv: messageEncrypted.iv,
				message: messageEncrypted.content,
				signature,
				type,
				timestamp,
				status,
				amount,
				failureReason,
				self
			};

			const index = invoicesGrouped.findIndex(
				(conversation: Conversation) => conversation.pubkey === pubkey
			);

			if (index !== -1) {
				invoicesGrouped[index].messages?.push(messageObject);
			} else {
				invoicesGrouped.push({
					pubkey,
					avatar,
					messages: [messageObject],
					read,
					blocked,
					charLimit
				});
			}
		} catch (error) {
			console.log(error);
			return;
		}
	}

	return invoicesGrouped;
};

export const initializePayments = async () => {
	const lastUpdate = localStorage.getItem('lastUpdate') || undefined;

	const { payments } = await lnc.lnd.lightning.listPayments({
		includeIncomplete: false,
		creationDateStart: lastUpdate
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

	const paymentsGrouped: Conversation[] = [];

	for await (const payment of paymentsFiltered) {
		const successfulHTLC = payment.htlcs.find((htlc) => htlc.status === 'SUCCEEDED')?.route?.hops;

		if (!successfulHTLC) return;

		const lastRouteHop = successfulHTLC[successfulHTLC.length - 1];

		if (!lastRouteHop) return;

		try {
			// conversation values
			const pubkey = lastRouteHop.pubKey;
			const avatar = '';
			const read = true;
			const blocked = 'false';
			const charLimit = lastRouteHop.pubKey === userPubkey ? 1000 : 300;

			// message values
			const preimage = lastRouteHop.customRecords[KEYSEND_PREIMAGE].toString();
			const message = bufferBase64ToUtf(lastRouteHop.customRecords[MESSAGE_CONTENT]);
			const messageEncrypted = await encrypt(message);
			if (!messageEncrypted) return;
			const signature = bufferBase64ToUtf(lastRouteHop.customRecords[SIGNATURE]);
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
				iv: messageEncrypted.iv,
				message: messageEncrypted.content,
				signature,
				type,
				timestamp,
				status,
				amount,
				fee,
				failureReason,
				self
			};

			const index = paymentsGrouped.findIndex(
				(conversation: Conversation) => conversation.pubkey === pubkey
			);

			if (index !== -1) {
				paymentsGrouped[index].messages?.push(messageObject);
			} else {
				paymentsGrouped.push({
					pubkey,
					avatar,
					messages: [messageObject],
					read,
					blocked,
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

export const combineConversations = async (invoices: Conversation[], payments: Conversation[]) => {
	const conversations = [...invoices];

	payments.forEach((payment) => {
		const index = conversations.findIndex((conversation) => conversation.pubkey === payment.pubkey);

		if (index !== -1) {
			if (payment.messages) {
				const messages = conversations[index].messages?.concat(payment.messages);

				conversations[index].messages = messages || payment.messages;
			}
		} else {
			conversations.push(payment);
		}
	});

	return conversations;
};

export const finalizeConversations = async (conversations: Conversation[]) => {
	for await (const conversation of conversations) {
		conversation.messages?.sort((a, b) => a.timestamp - b.timestamp);

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
	}

	return conversations;
};

export const saveToDB = async (conversations: Conversation[]) => {
	const firstSyncComplete = localStorage.getItem('firstSyncComplete');

	if (firstSyncComplete) {
		const primaryKeys = conversations.map((conversation) => conversation.pubkey);

		const recordsInDB = await db.conversations.bulkGet(primaryKeys);

		for await (const conversation of conversations) {
			const recordExists = recordsInDB.find((record) => record?.pubkey === conversation.pubkey);

			if (recordExists) {
				const currentMessages = recordExists.messages || [];
				const newMessages = conversation.messages || [];
				const updatedMessages = [...currentMessages, ...newMessages];

				await db.conversations.update(conversation.pubkey, {
					alias: conversation.alias,
					color: conversation.color,
					messages: updatedMessages,
					read: conversation.read
				});
			} else {
				await db.conversations.add(conversation);
			}
		}

		setLastUpdate(updateTime);
	} else {
		try {
			await db.conversations.bulkAdd(conversations, undefined, { allKeys: false });

			setLastUpdate(updateTime);
			setFirstSyncComplete();
		} catch (err) {
			console.log(err);

			await db.conversations.clear();
			throw error(503, 'Initial sync failed, please try again.');
		}
	}
};
