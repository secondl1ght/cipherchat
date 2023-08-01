import { pubkey } from '$lib/store';
import { get } from 'svelte/store';
import { lnc } from '$lib/lnc';
import { bufferUtfToBase64, bufferBase64ToUtf } from '$lib/buffer';
import {
	type Conversation,
	type Message,
	MessageType,
	MessageStatus,
	FailureReason
} from '$lib/db';
import { encrypt } from '$lib/crypto';

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

		const preimage = successfulHTLC.customRecords[5482373484];
		const timestamp = successfulHTLC.customRecords[34349343];
		const message = successfulHTLC.customRecords[34349334];
		const signature = successfulHTLC.customRecords[34349337];
		const pubkey = successfulHTLC.customRecords[34349339];
		const type = successfulHTLC.customRecords[34349345];

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
			const pubkey = bufferBase64ToUtf(successfulHTLC.customRecords[34349339]);
			const avatar = '';
			const read = false;
			const blocked = false;
			const charLimit = 300;

			// message values
			const preimage = successfulHTLC.customRecords[5482373484].toString();
			const message = bufferBase64ToUtf(successfulHTLC.customRecords[34349334]);
			const messageEncrypted = await encrypt(message);
			const signature = bufferBase64ToUtf(successfulHTLC.customRecords[34349337]);
			const type = messageType.find(
				(type) => type === bufferBase64ToUtf(successfulHTLC.customRecords[34349345])
			);
			if (!type) return;
			const timestamp = bufferBase64ToUtf(successfulHTLC.customRecords[34349343]);
			const status = MessageStatus.Succeeded;
			const amount = Number(invoice.amtPaidSat);
			const failureReason = FailureReason.None;

			const messageObject: Message = {
				id: preimage,
				iv: messageEncrypted.iv,
				message: messageEncrypted.content,
				signature,
				type,
				timestamp,
				status,
				amount,
				failureReason
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
