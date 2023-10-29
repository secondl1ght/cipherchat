<script lang="ts">
	import {
		addConversation,
		clearBadge,
		formatPaymentMsg,
		setBadge,
		subscribeInvoices
	} from '$lib/chat';
	import { decrypt } from '$lib/crypto';
	import { db } from '$lib/db';
	import {
		activeConversation,
		appView,
		conversation,
		conversationLoading,
		conversations,
		innerWidth,
		lnc,
		messageHistory,
		messages,
		messagesLoading,
		scrollDiv,
		scrollDivPosition,
		sendLoading,
		sharePubkey,
		userAlias,
		userColor,
		userPubkey
	} from '$lib/store';
	import {
		combineConversations,
		finalizeConversations,
		fixPendingMessages,
		initializeInvoices,
		initializePayments,
		saveToDB
	} from '$lib/sync';
	import { AppViewState, MessageType, type ConversationConstruction } from '$lib/types';
	import {
		errorToast,
		getUpdateTime,
		setError,
		setFirstSyncComplete,
		setLastUpdate
	} from '$lib/utils';
	import { ChatLoading, ConvoView, HomeView } from 'comp';
	import Dexie, { liveQuery } from 'dexie';
	import linkifyStr from 'linkify-string';
	import { onMount, tick } from 'svelte';
	import { blur } from 'svelte/transition';

	let loading = true;

	let conversationsQuery = liveQuery(async () => {
		try {
			const convos = await db.conversations
				.where('blocked')
				.equals('false')
				.reverse()
				.sortBy('lastUpdate');

			const msgs = await db.messages.bulkGet(convos.map((c) => c.latestMessage || ''));

			const convosFormatted = convos.map(async (c) => {
				const latestMessage = msgs.find((m) => m?.id === c.latestMessage);

				if (latestMessage) {
					if (latestMessage.hide) {
						return { ...c, latestMessage: 'This message is hidden.' };
					}

					if (latestMessage.type === MessageType.Payment) {
						const paymentMsg = formatPaymentMsg(latestMessage.self, latestMessage.amount);

						return { ...c, latestMessage: paymentMsg };
					}

					const decryptedMsg = await Dexie.waitFor(
						decrypt(latestMessage.iv, latestMessage.message)
					);

					return { ...c, latestMessage: decryptedMsg };
				} else {
					return c;
				}
			});

			const result = await Promise.all(convosFormatted);

			conversations.set(result);

			return 'Conversations query complete.';
		} catch (error) {
			console.log(error);
			errorToast('Could not query conversations.');
		}
	});

	$: conversationQuery = liveQuery(async () => {
		try {
			const convo = await db.conversations.get($activeConversation);

			if (convo) {
				conversation.set(convo);
			}

			return 'Conversation query complete.';
		} catch (error) {
			console.log(error);
			errorToast('Could not query conversation.');
		}
	});

	$: unreadQuery = liveQuery(async () => {
		try {
			let unreadCount;

			await db.conversations
				.where('unread')
				.above(0)
				.keys((keysArray) => (unreadCount = keysArray.reduce((p, c) => Number(p) + Number(c), 0)));

			if (unreadCount) {
				await Dexie.waitFor(setBadge(unreadCount));
			} else {
				await Dexie.waitFor(clearBadge());
			}

			return 'Unread query complete.';
		} catch (error) {
			console.log(error);
			errorToast('Could not query unread messages count.');
		}
	});

	let messagesQueryLoading = false;

	const options = {
		className: 'underline underline-offset-2',
		defaultProtocol: 'https',
		rel: 'noreferrer',
		target: '_blank'
	};

	$: messagesQuery = liveQuery(async () => {
		try {
			messagesQueryLoading = true;

			const msgs = await db.messages
				.where('pubkey')
				.equals($activeConversation)
				.sortBy('receivedTime');

			const sliceLength = msgs.length - $messageHistory < 0 ? 0 : msgs.length - $messageHistory;

			const msgsFormatted = msgs.slice(sliceLength, msgs.length).map(async (m) => {
				if (m.hide) {
					return { ...m, message: 'This message is hidden.' };
				}

				if (m.type === MessageType.Payment) {
					const paymentMsg = formatPaymentMsg(m.self, m.amount);

					return { ...m, message: paymentMsg };
				}

				const decryptedMsg = await Dexie.waitFor(decrypt(m.iv, m.message));

				const linkifiedMsg = decryptedMsg ? linkifyStr(decryptedMsg, options) : undefined;

				return {
					...m,
					message: decryptedMsg || 'Could not decrypt message.',
					linkified: linkifiedMsg
				};
			});

			const result = await Promise.all(msgsFormatted);

			messages.set(result);

			messagesQueryLoading = false;

			return 'Messages query complete.';
		} catch (error) {
			console.log(error);
			errorToast('Could not query messages.');
			messagesQueryLoading = false;
		}
	});

	const messagesUpdates = async () => {
		await tick();

		if ($conversationLoading) {
			$conversationLoading = false;
		}

		if ($messagesLoading) {
			if ($scrollDivPosition !== undefined) {
				$scrollDiv.scrollTop = $scrollDiv.scrollHeight - $scrollDivPosition;
			}

			$messagesLoading = false;
		}

		if ($sendLoading) {
			$scrollDiv.scrollTop = $scrollDiv.scrollHeight;
			$sendLoading = false;
		}
	};

	$: !messagesQueryLoading && messagesUpdates();

	$: console.log($conversationsQuery, $conversationQuery, $unreadQuery, $messagesQuery);

	onMount(async () => {
		try {
			db.open();

			const firstSyncComplete = localStorage.getItem('firstSyncComplete');

			const nodeInfo = await $lnc.lnd.lightning.getInfo();
			$userPubkey = nodeInfo.identityPubkey;
			$userAlias = nodeInfo.alias;
			$userColor = nodeInfo.color;

			if (firstSyncComplete) {
				const updateTime = getUpdateTime();

				const invoices = await initializeInvoices();

				if (invoices) {
					const conversationsFinalized = await finalizeConversations(invoices);

					await saveToDB(conversationsFinalized);
				} else {
					setLastUpdate(updateTime);
				}

				fixPendingMessages();
			} else {
				let invoices: ConversationConstruction[] | undefined;
				let payments: ConversationConstruction[] | undefined;

				const updateTime = getUpdateTime();

				await Promise.all([initializeInvoices(), initializePayments()]).then((values) => {
					invoices = values[0];
					payments = values[1];
				});

				if (invoices && payments) {
					const conversationsCombined = combineConversations(invoices, payments);

					const conversationsFinalized = await finalizeConversations(conversationsCombined);

					await saveToDB(conversationsFinalized);
				} else if (invoices) {
					const conversationsFinalized = await finalizeConversations(invoices);

					await saveToDB(conversationsFinalized);
				} else if (payments) {
					const conversationsFinalized = await finalizeConversations(payments);

					await saveToDB(conversationsFinalized);
				} else {
					setLastUpdate(updateTime);
					setFirstSyncComplete();
				}
			}

			if ($sharePubkey) {
				await addConversation($sharePubkey);
				$sharePubkey = '';
				history.replaceState(null, '', '/');
			}

			subscribeInvoices();

			loading = false;
		} catch (err) {
			console.log(err);
			setError('503', 'Initial sync failed, please try again.');
		}
	});
</script>

<svelte:window bind:innerWidth={$innerWidth} />

{#if loading}
	<ChatLoading />
{:else}
	<div class="h-[100dvh] w-full overflow-hidden lg:flex">
		{#if $appView === AppViewState.Home || $innerWidth > 1024}
			<div in:blur={{ amount: 10 }} class="h-full w-full lg:w-1/3 lg:min-w-[396px] lg:max-w-xl">
				<HomeView />
			</div>
		{/if}
		{#if $appView === AppViewState.Convo || $innerWidth > 1024}
			<div in:blur={{ amount: 10 }} class="h-full w-full">
				<ConvoView />
			</div>
		{/if}
	</div>
{/if}
