import {
	bufferBase64ToUtf,
	bufferHexToBase64,
	bufferToBase64,
	bufferUtfToBase64
} from '$lib/buffer';
import { createHash, encrypt, randomBytes } from '$lib/crypto';
import { MessageType, db, type Conversation, type Message } from '$lib/db';
import { lnc } from '$lib/lnc';
import { activeConversation, addConvo, clearMessage, lockMessage, userPubkey } from '$lib/store';
import { validateInvoice } from '$lib/sync';
import { TLV_RECORDS } from '$lib/tlv';
import { errorToast, formatNumber, setLastUpdate, shortenPubkey, warningToast } from '$lib/utils';
import { lnrpc } from '@lightninglabs/lnc-web';
import { tick } from 'svelte';
import { get } from 'svelte/store';

const { KEYSEND_PREIMAGE, SENDERS_PUBKEY, TIMESTAMP, MESSAGE_CONTENT, SIGNATURE, CONTENT_TYPE } =
	TLV_RECORDS;

const messageType = Object.values(MessageType);

const notificationSound = new Audio('/audio/notification.mp3');

export const subscribeInvoices = () => {
	lnc.lnd.lightning.subscribeInvoices(
		undefined,
		async (msg) => {
			try {
				const validated = await validateInvoice(msg);

				if (validated) {
					const successfulHTLC = msg.htlcs.find((htlc) => htlc.state === 'SETTLED');

					if (!successfulHTLC) return;

					// conversation values
					const pubkey = bufferBase64ToUtf(successfulHTLC.customRecords[SENDERS_PUBKEY]);
					const nodeInfo = await lnc.lnd.lightning.getNodeInfo({
						pubKey: pubkey,
						includeChannels: false
					});
					const alias = nodeInfo.node?.alias;
					const color = nodeInfo.node?.color;
					const avatar = '';
					const read = false;
					const blocked = 'false';
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
					const status = lnrpc.Payment_PaymentStatus.SUCCEEDED;
					const amount = Number(msg.amtPaidSat);
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

					const messageNotification = () => {
						if (
							(Notification.permission === 'granted' && get(activeConversation) !== pubkey) ||
							(Notification.permission === 'granted' && document.visibilityState === 'hidden')
						) {
							const playAudio = localStorage.getItem('playAudio') === 'true';
							const sendersNode = alias || shortenPubkey(pubkey);
							const notificationMessage =
								type === 'PAYMENT' ? `Received ${formatNumber(amount)} sats.` : message;

							const notification = new Notification(sendersNode, {
								badge: '/images/logo.png',
								body: notificationMessage,
								tag: pubkey,
								icon: '/images/logo-bg.png',
								vibrate: [210],
								renotify: true
							});

							if (playAudio) {
								notificationSound.play();
							}

							notification.addEventListener('click', () => {
								activeConversation.set(pubkey);
								window.focus();
							});

							document.addEventListener(
								'visibilitychange',
								() => {
									if (document.visibilityState === 'visible') {
										notification.close();
									}
								},
								{ once: true }
							);

							const body = document.querySelector('body');
							body?.addEventListener(
								'mouseover',
								() => {
									notification.close();
								},
								{ once: true }
							);
						}
					};

					await db.transaction('rw', db.conversations, async () => {
						const conversationExists = await db.conversations.get(pubkey);

						if (conversationExists) {
							conversationExists.alias = alias;
							conversationExists.color = color;
							conversationExists.read = read;

							const currentMessages = conversationExists.messages || [];
							currentMessages.push(messageObject);
							conversationExists.messages = currentMessages;

							await db.conversations.put(conversationExists);

							setLastUpdate((Number(msg.creationDate) + 1).toString());

							if (conversationExists.blocked === 'false') {
								messageNotification();
							}
						} else {
							await db.conversations.add({
								pubkey,
								alias,
								color,
								avatar,
								messages: [messageObject],
								read,
								blocked,
								charLimit
							});

							setLastUpdate((Number(msg.creationDate) + 1).toString());
							messageNotification();
						}
					});
				} else {
					setLastUpdate((Number(msg.creationDate) + 1).toString());
				}
			} catch (error) {
				console.log(error);
				errorToast('Message received but could not save.');
			}
		},
		(err) => {
			console.log(err);
			errorToast('Message receive failed.');
		}
	);
};

export const addConversation = async (pubkey: string) => {
	if (pubkey === get(userPubkey)) {
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

	const sendersPubkey = bufferUtfToBase64(get(userPubkey));
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

	const updateMessage = (type: string, msg?: lnrpc.Payment) => {
		db.transaction('rw', db.conversations, async () => {
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
					[SIGNATURE]: signature.signature,
					[SENDERS_PUBKEY]: sendersPubkey,
					[CONTENT_TYPE]: typeFormatted
				},
				timeoutSeconds: 60,
				feeLimitSat,
				timePref,
				allowSelfPayment: false,
				noInflightUpdates: true
			},
			(msg) => {
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
			(err) => {
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
