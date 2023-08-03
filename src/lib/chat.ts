import { pubkey } from '$lib/store';
import { get } from 'svelte/store';
import { lnc } from '$lib/lnc';
import { bufferUtfToBase64, bufferBase64ToUtf } from '$lib/buffer';
import { type Conversation, type Message, MessageType } from '$lib/db';
import { encrypt } from '$lib/crypto';
import { lnrpc } from '@lightninglabs/lnc-web';

// TLV records
const KEYSEND_PREIMAGE = 5482373484;
const SENDERS_PUBKEY = 34349339;
const TIMESTAMP = 34349343;
const MESSAGE_CONTENT = 34349334;
const SIGNATURE = 34349337;
const CONTENT_TYPE = 34349345;

const userPubkey = get(pubkey);
const messageType = Object.values(MessageType);

export const initializeInvoices = async () => {
	const lastUpdate = localStorage.getItem('lastUpdate') || undefined;

	const invoices = await lnc.lnd.lightning.listInvoices({
		creationDateStart: lastUpdate
	});

	const invoicesFiltered = invoices.invoices.filter(async (invoice) => {
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
			!type
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
	});

	const invoicesGrouped: Conversation[] = [];

	invoicesFiltered.forEach(async (invoice) => {
		const successfulHTLC = invoice.htlcs.find((htlc) => htlc.state === 'SETTLED');

		if (!successfulHTLC) return;

		try {
			// conversation values
			const pubkey = bufferBase64ToUtf(successfulHTLC.customRecords[SENDERS_PUBKEY]);
			const avatar = '';
			const read = false;
			const blocked = false;
			const charLimit = 300;

			// message values
			const preimage = successfulHTLC.customRecords[KEYSEND_PREIMAGE].toString();
			const message = bufferBase64ToUtf(successfulHTLC.customRecords[MESSAGE_CONTENT]);
			const messageEncrypted = await encrypt(message);
			const signature = bufferBase64ToUtf(successfulHTLC.customRecords[SIGNATURE]);
			const type = messageType.find(
				(type) => type === bufferBase64ToUtf(successfulHTLC.customRecords[CONTENT_TYPE])
			);
			if (!type) return;
			const timestamp = bufferBase64ToUtf(successfulHTLC.customRecords[TIMESTAMP]);
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
	});
	return invoicesGrouped;
};

export const initializePayments = async () => {
	const lastUpdate = localStorage.getItem('lastUpdate') || undefined;

	const payments = await lnc.lnd.lightning.listPayments({
		includeIncomplete: false,
		creationDateStart: lastUpdate
	});

	const paymentsFiltered = payments.payments.filter((payment) => {
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

	paymentsFiltered.forEach(async (payment) => {
		const successfulHTLC = payment.htlcs.find((htlc) => htlc.status === 'SUCCEEDED')?.route?.hops;

		if (!successfulHTLC) return false;

		const lastRouteHop = successfulHTLC[successfulHTLC.length - 1];

		if (!lastRouteHop) return false;

		try {
			// conversation values
			const pubkey = lastRouteHop.pubKey;
			const avatar = '';
			const read = true;
			const blocked = false;
			const charLimit = 300;

			// message values
			const preimage = lastRouteHop.customRecords[KEYSEND_PREIMAGE].toString();
			const message = bufferBase64ToUtf(lastRouteHop.customRecords[MESSAGE_CONTENT]);
			const messageEncrypted = await encrypt(message);
			const signature = bufferBase64ToUtf(lastRouteHop.customRecords[SIGNATURE]);
			const type = messageType.find(
				(type) => type === bufferBase64ToUtf(lastRouteHop.customRecords[CONTENT_TYPE])
			);
			if (!type) return;
			const timestamp = bufferBase64ToUtf(lastRouteHop.customRecords[TIMESTAMP]);
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
	});
	return paymentsGrouped;
};
