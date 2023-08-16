<script lang="ts">
	import { db, type Conversation } from '$lib/db';
	import { lnc } from '$lib/lnc';
	import { alias, color, pubkey } from '$lib/store';
	import {
		combineConversations,
		finalizeConversations,
		initializeInvoices,
		initializePayments,
		saveToDB
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
			$pubkey = nodeInfo.identityPubkey;
			$alias = nodeInfo.alias;
			$color = nodeInfo.color;

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
				let invoices: Conversation[] | undefined;
				let payments: Conversation[] | undefined;

				const updateTime = getUpdateTime();

				await Promise.all([initializeInvoices(), initializePayments()]).then((values) => {
					invoices = values[0];
					payments = values[1];
				});

				if (invoices && payments) {
					const conversationsCombined = await combineConversations(invoices, payments);

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

			conversations = liveQuery(
				async () => await db.conversations.where('blocked').equals('false').toArray()
			);

			loading = false;
		} catch (err) {
			console.log(err);
			setError('503', 'Initial sync failed, please try again.');
		} finally {
			// TODO
		}
	});
</script>
