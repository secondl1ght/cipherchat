<script lang="ts">
	import { onMount } from 'svelte';
	import { lnc } from '$lib/lnc';
	import { pubkey, alias, color } from '$lib/store';
	import type { Conversation } from '$lib/db';
	import { initializeInvoices, initializePayments, combineConversations } from '$lib/chat';
	import { error } from '@sveltejs/kit';

	let loading = true;

	onMount(async () => {
		try {
			const nodeInfo = await lnc.lnd.lightning.getInfo();
			$pubkey = nodeInfo.identityPubkey;
			$alias = nodeInfo.alias;
			$color = nodeInfo.color;

			let invoices: Conversation[] = [];
			let payments: Conversation[] = [];

			await Promise.all([initializeInvoices(), initializePayments()]).then((values) => {
				invoices = values[0] || [];
				payments = values[1] || [];
			});

			const conversations = await combineConversations(invoices, payments);

			loading = false;
		} catch (err) {
			console.log(err);
			throw error(503, 'Initial sync failed, please try again.');
		} finally {
			// TODO
		}
	});
</script>
