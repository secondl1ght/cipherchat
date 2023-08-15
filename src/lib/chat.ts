import { get } from 'svelte/store';
import {
	addConvo,
	activeConversation,
	lockMessage,
	clearMessage,
	pubkey,
	TLV_RECORDS
} from '$lib/store';
import { warningToast, errorToast } from '$lib/utils';
import { type Conversation, db, MessageType } from '$lib/db';
import { randomBytes, createHash, encrypt } from '$lib/crypto';
import { bufferToBase64, bufferUtfToBase64, bufferHexToBase64 } from '$lib/buffer';
import { lnrpc } from '@lightninglabs/lnc-web';
import { tick } from 'svelte';
import { lnc } from '$lib/lnc';

const userPubkey = get(pubkey);

const { KEYSEND_PREIMAGE, SENDERS_PUBKEY, TIMESTAMP, MESSAGE_CONTENT, SIGNATURE, CONTENT_TYPE } =
	get(TLV_RECORDS);

export const addConversation = async (pubkey: string) => {
	if (pubkey === userPubkey) {
		warningToast('Cannot start a conversation with yourself.');
	} else {
		try {
			addConvo.set('LOADING');

			const nodeInfo = await lnc.lnd.lightning.getNodeInfo({
				pubKey: pubkey,
				includeChannels: false
			});

			await db.transaction('rw', db.conversations, async () => {
				const conversationExists = await db.conversations.get(pubkey);

				if (conversationExists) {
					warningToast('You already have a conversation with this node.');
					addConvo.set('');
				} else {
					const conversation: Conversation = {
						pubkey,
						alias: nodeInfo.node?.alias,
						color: nodeInfo.node?.color,
						avatar: '',
						read: true,
						blocked: 'false',
						charLimit: 300
					};

					await db.conversations.add(conversation);
					activeConversation.set(pubkey);
					addConvo.set('SUCCESS');
				}
			});
		} catch (error) {
			console.log(error);
			errorToast('Could not add new conversation, please try again.');
			addConvo.set('');
		}
	}
};

export const sendMessage = async (recipient: string, message: string, amount?: number) => {
	lockMessage.set(recipient);

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

	const id = preimageFormatted;
	const status = lnrpc.Payment_PaymentStatus.IN_FLIGHT;
	const failureReason = lnrpc.PaymentFailureReason.FAILURE_REASON_NONE;
	const self = true;
	const finalAmount = amount || 1;

	const sendersPubkey = bufferUtfToBase64(get(pubkey));
	const recipientFormatted = bufferHexToBase64(recipient);

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
		lockMessage.set('');
		await tick();
		clearMessage.set('');
	} catch (error) {
		console.log(error);
		errorToast(`Could not attempt sending ${amount ? 'payment' : 'message'}, please try again.`);
		lockMessage.set('');
		return;
	}

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

	// sign message
	let signature: lnrpc.SignMessageResponse;

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
				allowSelfPayment: false,
				noInflightUpdates: true
			},
			async (msg) => {
				if (msg.status === lnrpc.Payment_PaymentStatus.FAILED) {
					try {
						updateMessage('FAILED', msg);
					} catch (error) {
						console.log(error);
						errorToast('Could not send message.');
					}
				} else if (msg.status === lnrpc.Payment_PaymentStatus.SUCCEEDED) {
					try {
						updateMessage('SUCCESS', msg);
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
