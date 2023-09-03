<script lang="ts">
	import { subscribeInvoices } from '$lib/chat';
	import { decrypt } from '$lib/crypto';
	import { db } from '$lib/db';
	import { lnc } from '$lib/lnc';
	import {
		activeConversation,
		appView,
		conversations,
		innerWidth,
		messageHistory,
		messages,
		userAlias,
		userColor,
		userPubkey
	} from '$lib/store';
	import {
		combineConversations,
		finalizeConversations,
		initializeInvoices,
		initializePayments,
		saveToDB
	} from '$lib/sync';
	import { AppViewState, type ConversationConstruction } from '$lib/types';
	import {
		errorToast,
		getUpdateTime,
		setError,
		setFirstSyncComplete,
		setLastUpdate
	} from '$lib/utils';
	import { ChatLoading, ConvoView, HomeView } from 'comp';
	import Dexie, { liveQuery } from 'dexie';
	import { onMount } from 'svelte';

	let loading = true;

	let conversationsQuery = liveQuery(async () => {
		try {
			const convos = await db.conversations
				.where('blocked')
				.equals('false')
				.reverse()
				.sortBy('lastUpdate');

			const msgs = await db.messages.bulkGet(convos.map((c) => c.latestMessage));

			const convosFormatted = convos.map(async (c) => {
				const latestMessage = msgs.find((m) => m?.id === c.latestMessage);

				if (latestMessage) {
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

	$: messagesQuery = liveQuery(async () => {
		try {
			const msgs = await db.messages
				.where('pubkey')
				.equals($activeConversation)
				.limit($messageHistory)
				.sortBy('receivedTime');

			const msgsFormatted = msgs.map(async (m) => {
				const decryptedMsg = await Dexie.waitFor(decrypt(m.iv, m.message));

				return { ...m, message: decryptedMsg || 'Could not decrypt message.' };
			});

			const result = await Promise.all(msgsFormatted);

			messages.set(result);

			return 'Messages query complete.';
		} catch (error) {
			console.log(error);
			errorToast('Could not query messages.');
		}
	});

	$: console.log($conversationsQuery, $messagesQuery);

	onMount(async () => {
		try {
			db.open();

			const firstSyncComplete = localStorage.getItem('firstSyncComplete');

			const nodeInfo = await lnc.lnd.lightning.getInfo();
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

			subscribeInvoices();

			loading = false;
		} catch (err) {
			console.log(err);
			setError('503', 'Initial sync failed, please try again.');
		} finally {
			// TODO
		}
	});
</script>

<svelte:window bind:innerWidth={$innerWidth} />

{#if loading}
	<ChatLoading />
{:else}
	<div class="h-[100dvh] w-full lg:flex">
		{#if $appView === AppViewState.Home || $innerWidth > 1024}
			<HomeView />
		{/if}
		{#if $appView === AppViewState.Convo || $innerWidth > 1024}
			<ConvoView />
		{/if}
	</div>
{/if}
