import {
	bufferBase64ToUtf,
	bufferHexToBase64,
	bufferToBase64,
	bufferUtfToBase64
} from '$lib/buffer';
import { createHash, encrypt, randomBytes } from '$lib/crypto';
import { db } from '$lib/db';
import {
	activeConversation,
	appView,
	convoState,
	homeState,
	lnc as lncStore,
	LNRPC as lnrpcStore,
	messageHistory,
	sendLoading,
	sharePubkey,
	userPubkey
} from '$lib/store';
import { validateInvoice } from '$lib/sync';
import { TLV_RECORDS } from '$lib/tlv';
import { AppViewState, MessageType, type Conversation, type Message } from '$lib/types';
import {
	errorToast,
	formatNumber,
	getTimestamp,
	setLastUpdate,
	shortenPubkey,
	warningToast
} from '$lib/utils';
import type LNC from '@lightninglabs/lnc-web';
import type { lnrpc } from '@lightninglabs/lnc-web';
import { get } from 'svelte/store';

let lnc: LNC;
let LNRPC: typeof lnrpc;

lncStore.subscribe((value) => (lnc = value));
lnrpcStore.subscribe((value) => (LNRPC = value));

const { KEYSEND_PREIMAGE, SENDERS_PUBKEY, TIMESTAMP, MESSAGE_CONTENT, SIGNATURE, CONTENT_TYPE } =
	TLV_RECORDS;

const messageType = Object.values(MessageType);

const notificationSound = new Audio('/audio/notification.mp3');
const messageSound = new Audio('/audio/message.mp3');

export const formatPaymentMsg = (self: boolean, amount: number) =>
	`${self ? 'Sent' : 'Received'} ${formatNumber(amount)} sats.`;

export const statusIcon = (status: lnrpc.Payment_PaymentStatus) => {
	switch (status) {
		case LNRPC.Payment_PaymentStatus.IN_FLIGHT:
			return 'loader';
		case LNRPC.Payment_PaymentStatus.SUCCEEDED:
			return 'check-circle';
		case LNRPC.Payment_PaymentStatus.FAILED:
			return 'x-circle';
		default:
			return 'alert-circle';
	}
};

export const setBadge = async (count: number) => {
	try {
		if ('setAppBadge' in navigator) {
			await navigator.setAppBadge(count);
		}
	} catch (error) {
		console.log(error);
		errorToast('Could not set unread messages app badge count.');
	}
};

export const clearBadge = async () => {
	if ('clearAppBadge' in navigator) {
		await navigator.clearAppBadge();
	}
};

export const clearUnread = async () => {
	try {
		await db.transaction('rw', db.conversations, async () => {
			const activeConvo = get(activeConversation);

			const convo = await db.conversations.get(activeConvo);

			if (convo && convo.unread) {
				convo.unread = 0;
				await db.conversations.put(convo);
			}
		});
	} catch (error) {
		console.log(error);
		errorToast('Could not clear unread messages for active conversation.');
	}
};

const messageNotification = async (
	pubkey: string,
	alias: string | undefined,
	type: MessageType,
	amount: number,
	message: string
) => {
	const playAudio = localStorage.getItem('playAudio') === 'true';

	if (
		(Notification.permission === 'granted' && get(activeConversation) !== pubkey) ||
		(Notification.permission === 'granted' && document.visibilityState === 'hidden')
	) {
		const sendersNode = alias || shortenPubkey(pubkey);
		const notificationMessage =
			type === MessageType.Payment ? formatPaymentMsg(false, amount) : message;

		const options = {
			badge: '/images/logo.png',
			body: notificationMessage,
			tag: pubkey,
			icon: '/images/logo-bg.png',
			vibrate: [210],
			renotify: true
		};

		try {
			const notification = new Notification(sendersNode, options);

			notification.addEventListener('click', () => {
				messageHistory.set(25);
				activeConversation.set(pubkey);
				convoState.set('CHAT');
				homeState.set('HOME');
				appView.set(AppViewState.Convo);
				window.focus();
				clearUnread();
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
		} catch (error) {
			console.log(error);

			try {
				const registration = await navigator.serviceWorker.getRegistration();

				if (registration) {
					registration.showNotification(sendersNode, options);

					document.addEventListener(
						'visibilitychange',
						() => {
							if (document.visibilityState === 'visible') {
								registration.getNotifications().then((n) => n.forEach((i) => i.close()));
							}
						},
						{ once: true }
					);

					const body = document.querySelector('body');
					body?.addEventListener(
						'mouseover',
						() => {
							registration.getNotifications().then((n) => n.forEach((i) => i.close()));
						},
						{ once: true }
					);
				}
			} catch (error) {
				console.log(error);
				warningToast('Could not show notification for message.');
			}
		}

		if (playAudio && window.innerWidth > 640) {
			notificationSound.play();
		}
	} else if (
		get(activeConversation) === pubkey &&
		document.visibilityState === 'visible' &&
		playAudio
	) {
		messageSound.play();
	}
};

export const subscribeInvoices = () => {
	lnc.lnd.lightning.subscribeInvoices(
		undefined,
		async (msg) => {
			try {
				const validated = await validateInvoice(msg);

				if (validated === true) {
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
					const receivedTime = getTimestamp();
					const status = LNRPC.Payment_PaymentStatus.SUCCEEDED;
					const amount = Number(msg.amtPaidSat);
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

					await db.transaction('rw', db.conversations, db.messages, async () => {
						const conversationExists = await db.conversations.get(pubkey);

						if (conversationExists) {
							conversationExists.alias = alias;
							conversationExists.color = color;
							conversationExists.unread++;
							conversationExists.latestMessage = messageObject.id;
							conversationExists.latestMessageStatus = messageObject.status;
							conversationExists.lastUpdate = messageObject.receivedTime;

							await db.conversations.put(conversationExists);
							await db.messages.add(messageObject);

							setLastUpdate((Number(msg.creationDate) + 1).toString());

							if (conversationExists.blocked === 'false') {
								messageNotification(pubkey, alias, type, amount, message);
							}
						} else {
							await db.conversations.add({
								pubkey,
								alias,
								color,
								unread,
								blocked,
								bookmarked,
								charLimit,
								latestMessage: messageObject.id,
								latestMessageStatus: messageObject.status,
								lastUpdate: messageObject.receivedTime
							});
							await db.messages.add(messageObject);

							setLastUpdate((Number(msg.creationDate) + 1).toString());
							messageNotification(pubkey, alias, type, amount, message);
						}
					});
				} else if (validated === 'ANON') {
					const successfulHTLC = msg.htlcs.find((htlc) => htlc.state === 'SETTLED');

					if (!successfulHTLC) return;

					// conversation values
					const pubkey = 'ANON';
					const alias = 'Anonymous';
					const color = '#5A7FFF';
					const unread = 1;
					const blocked = 'false';
					const bookmarked = 'false';
					const charLimit = 300;

					// message values
					const preimage = msg.rPreimage.toString();
					const message = bufferBase64ToUtf(successfulHTLC.customRecords[MESSAGE_CONTENT]);
					const messageEncrypted = await encrypt(message);
					if (!messageEncrypted) return;
					const type = MessageType.Text;
					const timestamp = Number(msg.creationDate) * 1000000000;
					const receivedTime = getTimestamp();
					const status = LNRPC.Payment_PaymentStatus.SUCCEEDED;
					const amount = Number(msg.amtPaidSat);
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

					const showAnon = localStorage.getItem('showAnon') === 'true' ? true : false;

					await db.transaction('rw', db.conversations, db.messages, async () => {
						const conversationExists = await db.conversations.get(pubkey);

						if (conversationExists) {
							conversationExists.unread++;
							conversationExists.latestMessage = messageObject.id;
							conversationExists.latestMessageStatus = messageObject.status;
							conversationExists.lastUpdate = messageObject.receivedTime;

							await db.conversations.put(conversationExists);
							await db.messages.add(messageObject);

							setLastUpdate((Number(msg.creationDate) + 1).toString());

							if (showAnon) {
								messageNotification(pubkey, alias, type, amount, message);
							}
						} else {
							await db.conversations.add({
								pubkey,
								alias,
								color,
								unread,
								blocked,
								bookmarked,
								charLimit,
								latestMessage: messageObject.id,
								latestMessageStatus: messageObject.status,
								lastUpdate: messageObject.receivedTime
							});
							await db.messages.add(messageObject);

							setLastUpdate((Number(msg.creationDate) + 1).toString());

							if (showAnon) {
								messageNotification(pubkey, alias, type, amount, message);
							}
						}
					});
				} else {
					setLastUpdate((Number(msg.creationDate) + 1).toString());
				}
			} catch (error: any) {
				console.log(error);

				if (error?.message?.includes('Key already exists in the object store')) {
					return;
				}

				errorToast('Message received but could not save.');
			}
		},
		(err) => {
			console.log(err);

			if (
				err.message ===
				'rpc error: code = Unavailable desc = error reading from server: error decrypting payload: error receiving from go-back-n connection: cannot receive, gbn exited'
			) {
				warningToast('Lost connection to node, trying to reconnect...');
			} else {
				errorToast('Message receive failed.');
			}
		}
	);
};

export const addConversation = async (pubkey: string) => {
	if (pubkey === get(userPubkey)) {
		warningToast('Cannot start a conversation with yourself.');
	} else {
		try {
			const nodeInfo = await lnc.lnd.lightning.getNodeInfo({
				pubKey: pubkey,
				includeChannels: false
			});

			await db.transaction('rw', db.conversations, async () => {
				const conversationExists = await db.conversations.get(pubkey);

				if (conversationExists) {
					if (!get(sharePubkey)) {
						warningToast('You already have a conversation with this node.');
					} else {
						activeConversation.set(pubkey);
						appView.set(AppViewState.Convo);
						clearUnread();
					}
				} else {
					const conversation: Conversation = {
						pubkey,
						alias: nodeInfo.node?.alias,
						color: nodeInfo.node?.color,
						unread: 0,
						blocked: 'false',
						bookmarked: 'false',
						charLimit: 300
					};

					await db.conversations.add(conversation);

					messageHistory.set(25);
					activeConversation.set(pubkey);
					convoState.set('CHAT');
					homeState.set('HOME');
					appView.set(AppViewState.Convo);
				}
			});
		} catch (error: any) {
			console.log(error);
			if (
				error?.message &&
				error.message === 'rpc error: code = NotFound desc = unable to find node'
			) {
				errorToast('Unable to find node in the graph.');
			} else {
				errorToast('Could not start a new conversation, please try again.');
			}
		}
	}
};

export const sendMessage = async (recipient: string, message: string, amount?: number) => {
	sendLoading.set(true);

	// setup data
	const timestamp = getTimestamp();
	const timestampFormmatted = bufferUtfToBase64(timestamp.toString());

	const preimage = randomBytes(32).buffer;
	const preimageHash = await createHash(preimage);
	const preimageHashFormatted = bufferToBase64(preimageHash);
	const preimageFormatted = bufferToBase64(preimage);

	const messageEncrypted = await encrypt(message);
	if (!messageEncrypted) {
		errorToast('Could not encrypt message, please try again.');
		return;
	}
	const messageFormatted = bufferUtfToBase64(message);

	const type = amount ? MessageType.Payment : MessageType.Text;
	const typeFormatted = bufferUtfToBase64(type);

	const id = preimageFormatted;
	const status = LNRPC.Payment_PaymentStatus.IN_FLIGHT;
	const failureReason = LNRPC.PaymentFailureReason.FAILURE_REASON_NONE;
	const self = true;
	const finalAmount = amount || 1;

	const sendersPubkey = bufferUtfToBase64(get(userPubkey));
	const recipientFormatted = bufferHexToBase64(recipient);

	const errText = amount ? 'payment' : 'message';

	// add to db
	try {
		await db.transaction('rw', db.conversations, db.messages, async () => {
			const conversation = await db.conversations.get(recipient);
			if (!conversation) return;

			const newMessage = {
				id,
				pubkey: recipient,
				iv: messageEncrypted.iv,
				message: messageEncrypted.content,
				type,
				timestamp,
				receivedTime: timestamp,
				status,
				amount: finalAmount,
				failureReason,
				self
			};

			conversation.latestMessage = newMessage.id;
			conversation.latestMessageStatus = newMessage.status;
			conversation.lastUpdate = newMessage.receivedTime;

			await db.conversations.put(conversation);
			await db.messages.add(newMessage);
		});

		const playAudio = localStorage.getItem('playAudio') === 'true';

		if (playAudio) {
			messageSound.play();
		}
	} catch (error) {
		console.log(error);
		errorToast(`Could not attempt sending ${errText}, please try again.`);
		return;
	}

	const updateMessage = (type: string, msg?: lnrpc.Payment) => {
		db.transaction('rw', db.messages, db.conversations, () => {
			if (type === 'SIGNATURE') {
				db.messages.update(id, {
					status: LNRPC.Payment_PaymentStatus.FAILED,
					failureReason: LNRPC.PaymentFailureReason.FAILURE_REASON_ERROR
				});

				db.conversations.update(recipient, {
					latestMessageStatus: LNRPC.Payment_PaymentStatus.FAILED
				});
			} else if (type === 'FAILED') {
				if (!msg) return;
				db.messages.update(id, {
					status: msg.status,
					failureReason: msg.failureReason,
					signature: signature.signature
				});

				db.conversations.update(recipient, { latestMessageStatus: msg.status });
			} else if (type === 'SUCCESS') {
				if (!msg) return;
				db.messages.update(id, {
					status: msg.status,
					fee: Number(msg.feeSat),
					signature: signature.signature
				});

				db.conversations.update(recipient, { latestMessageStatus: msg.status });
			} else if (type === 'ERROR') {
				db.messages.update(id, {
					status: LNRPC.Payment_PaymentStatus.FAILED,
					failureReason: LNRPC.PaymentFailureReason.FAILURE_REASON_ERROR,
					signature: signature.signature
				});

				db.conversations.update(recipient, {
					latestMessageStatus: LNRPC.Payment_PaymentStatus.FAILED
				});
			}
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
				if (msg.status === LNRPC.Payment_PaymentStatus.FAILED) {
					try {
						updateMessage('FAILED', msg);
					} catch (error) {
						console.log(error);
						errorToast(`Could not send ${errText}.`);
					}
				} else if (msg.status === LNRPC.Payment_PaymentStatus.SUCCEEDED) {
					try {
						updateMessage('SUCCESS', msg);
					} catch (error) {
						console.log(error);
						errorToast(
							`${amount ? 'Payment' : 'Message'} sent, but could not update status in the database.`
						);
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
					errorToast(`Could not send ${errText}.`);
				}
			}
		);
	} catch (error) {
		console.log(error);
		try {
			updateMessage('ERROR');
		} catch (error) {
			console.log(error);
			errorToast(`Could not send ${errText}.`);
		}
	}
};
