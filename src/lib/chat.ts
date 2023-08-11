import { randomBytes, createHash, encrypt } from '$lib/crypto';
import {
	bufferToBase64,
	bufferUtfToBase64,
	bufferHexToBase64,
	bufferBase64ToUtf
} from '$lib/buffer';
import { db, MessageType } from '$lib/db';
import { lnrpc } from '@lightninglabs/lnc-web';
import { get } from 'svelte/store';
import { clearMessage, pubkey, TLV_RECORDS } from '$lib/store';
import { tick } from 'svelte';
import { errorToast } from '$lib/utils';
import { lnc } from '$lib/lnc';

const { KEYSEND_PREIMAGE, SENDERS_PUBKEY, TIMESTAMP, MESSAGE_CONTENT, SIGNATURE, CONTENT_TYPE } =
	get(TLV_RECORDS);

export const sendMessage = async (recipient: string, message: string, amount?: number) => {
	// setup data
	const timestamp = Date.now() * 1000000;
	const timestampFormmatted = bufferUtfToBase64(timestamp.toString());

	const preimage = randomBytes(32).buffer;
	const preimageHash = await createHash(preimage);
	const preimageHashFormatted = bufferToBase64(preimageHash);
	const preimageFormatted = bufferToBase64(preimage);

	const messageEncrypted = await encrypt(message);
	if (!messageEncrypted) return;
	const messageFormatted = bufferUtfToBase64(message);

	const type = amount ? MessageType.Payment : MessageType.Text;
	const typeFormatted = bufferUtfToBase64(type);

	const id = bufferBase64ToUtf(preimageFormatted);
	const status = lnrpc.Payment_PaymentStatus.IN_FLIGHT;
	const failureReason = lnrpc.PaymentFailureReason.FAILURE_REASON_NONE;
	const self = true;
	const finalAmount = amount || 1;

	const sendersPubkey = bufferUtfToBase64(get(pubkey));
	const recipientFormatted = bufferHexToBase64(recipient);

	let signature: lnrpc.SignMessageResponse;

	const updateMessage = async (type: string, msg?: lnrpc.Payment) => {
		await db.transaction('rw', db.conversations, async () => {
			const conversation = await db.conversations.get(recipient);
			if (!conversation) return;
			const messages = conversation.messages || [];
			const messageIndex = messages.findIndex((message) => message.id === id);

			if (type === 'SIGNATURE') {
				messages[messageIndex].status = lnrpc.Payment_PaymentStatus.FAILED;
				messages[messageIndex].failureReason = lnrpc.PaymentFailureReason.FAILURE_REASON_ERROR;
			} else if (type === 'FAILED') {
				if (!msg) return;
				messages[messageIndex].status = msg.status;
				messages[messageIndex].failureReason = msg.failureReason;
				messages[messageIndex].signature = signature.signature;
			} else if (type === 'SUCCESS') {
				if (!msg) return;
				messages[messageIndex].status = msg.status;
				messages[messageIndex].fee = Number(msg.feeSat);
				messages[messageIndex].signature = signature.signature;
			} else if (type === 'ERROR') {
				messages[messageIndex].status = lnrpc.Payment_PaymentStatus.FAILED;
				messages[messageIndex].failureReason = lnrpc.PaymentFailureReason.FAILURE_REASON_ERROR;
				messages[messageIndex].signature = signature.signature;
			}

			conversation.messages = messages;

			db.conversations.put(conversation);
		});
	};

	// add to db
	try {
		await db.transaction('rw', db.conversations, async () => {
			const conversation = await db.conversations.get(recipient);
			if (!conversation) return;
			const messages = conversation.messages || [];

			const newMessage = {
				id,
				iv: messageEncrypted.iv,
				message: messageEncrypted.content,
				type,
				timestamp,
				status,
				amount: finalAmount,
				failureReason,
				self
			};
			messages.push(newMessage);

			conversation.messages = messages;

			await db.conversations.put(conversation);
		});

		clearMessage.set(recipient);
		await tick();
		clearMessage.set('');
	} catch (error) {
		console.log(error);
		errorToast(`Could not attempt sending ${amount ? 'payment' : 'message'}, please try again.`);
		return;
	}

	// sign message
	try {
		signature = await lnc.lnd.lightning.signMessage({
			msg: bufferUtfToBase64(recipient + timestamp.toString() + message)
		});
	} catch (error) {
		console.log(error);
		try {
			updateMessage('SIGNATURE');
		} catch (error) {
			console.log(error);
			errorToast('Could not sign message.');
		}
		return;
	}

	const signatureFormatted = bufferUtfToBase64(signature.signature);

	// send message
	try {
		const feeLimitSat = localStorage.getItem('feeLimit') || '10';
		const timePref = Number(localStorage.getItem('timePref')) || 0;

		lnc.lnd.router.sendPaymentV2(
			{
				dest: recipientFormatted,
				amt: finalAmount.toString(),
				paymentHash: preimageHashFormatted,
				destCustomRecords: {
					[KEYSEND_PREIMAGE]: preimageFormatted,
					[MESSAGE_CONTENT]: messageFormatted,
					[TIMESTAMP]: timestampFormmatted,
					[SIGNATURE]: signatureFormatted,
					[SENDERS_PUBKEY]: sendersPubkey,
					[CONTENT_TYPE]: typeFormatted
				},
				timeoutSeconds: 60,
				feeLimitSat,
				timePref,
				allowSelfPayment: true,
				noInflightUpdates: true
			},
			async (msg) => {
				if (msg.status === lnrpc.Payment_PaymentStatus.FAILED) {
					try {
						updateMessage('FAILED');
					} catch (error) {
						console.log(error);
						errorToast('Could not send message.');
					}
				} else if (msg.status === lnrpc.Payment_PaymentStatus.SUCCEEDED) {
					try {
						updateMessage('SUCCESS');
					} catch (error) {
						console.log(error);
						errorToast('Message sent, but could not update status in the database.');
					}
				}
			},
			async (err) => {
				if (err.message === 'EOF') return;
				console.log(err);
				try {
					updateMessage('ERROR');
				} catch (error) {
					console.log(error);
					errorToast('Could not send message.');
				}
			}
		);
	} catch (error) {
		console.log(error);
		try {
			updateMessage('ERROR');
		} catch (error) {
			console.log(error);
			errorToast('Could not send message.');
		}
	}
};
