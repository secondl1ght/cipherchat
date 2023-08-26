<script lang="ts">
	import { subscribeInvoices } from '$lib/chat';
	import { db, type Conversation } from '$lib/db';
	import { lnc } from '$lib/lnc';
	import { activeConversation, userAlias, userColor, userPubkey } from '$lib/store';
	import {
		combineConversations,
		finalizeConversations,
		initializeInvoices,
		initializePayments,
		saveToDB,
		type ConversationConstruction
	} from '$lib/sync';
	import { getUpdateTime, setError, setFirstSyncComplete, setLastUpdate } from '$lib/utils';
	import { liveQuery, type Observable } from 'dexie';
	import { onMount } from 'svelte';

	let loading = true;

	let conversations: Observable<Conversation[]>;

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

				localStorage.setItem('playAudio', 'true');
			}

			subscribeInvoices();

			conversations = liveQuery(async () => {
				const query = await db.conversations
					.where('blocked')
					.equals('false')
					.reverse()
					.sortBy('lastUpdate');

				if (loading) {
					activeConversation.set(query[0].pubkey);
				}

				return query;
			});

			loading = false;
		} catch (err) {
			console.log(err);
			setError('503', 'Initial sync failed, please try again.');
		} finally {
			// TODO
		}
	});
</script>
