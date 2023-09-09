<script lang="ts">
	import { addConversation } from '$lib/chat';
	import { Button, Icon, Link } from 'comp';

	let loading = false;
	let pubkey = '';
	let showInfo = false;

	const add = async () => {
		loading = true;
		await addConversation(pubkey);
		loading = false;
	};

	const handleEnter = (e: any) => {
		if (e.key === 'Enter' && pubkey) {
			add();
		}
	};
</script>

<form class="w-full" on:submit|preventDefault>
	<label for="add" class="flex items-center text-lg font-bold text-header md:text-xl lg:text-2xl">
		Node Pubkey <Icon icon="key" style="ml-3" />
	</label>
	<input
		id="add"
		name="add"
		type="text"
		required
		disabled={loading}
		bind:value={pubkey}
		on:keydown={handleEnter}
		placeholder="021ef14c694456a3aae34..."
		class="mb-5 mt-2 block h-16 w-full border-[1px] border-header bg-borderIn px-2 text-sm text-header placeholder:text-sm md:text-base md:placeholder:text-base"
	/>

	<Button
		click={add}
		title="Start Conversation"
		disabled={loading || !pubkey}
		{loading}
		loadingText="Starting..."
		style="!w-full !h-16"
	/>

	<button
		type="button"
		class="mx-auto mt-5 flex items-center text-header transition-colors hover:text-button"
		on:click={() => (showInfo = !showInfo)}
	>
		What's this? <Icon
			icon="chevron-up"
			style="{showInfo ? 'rotate-180' : 'rotate-0'} transition-transform ml-3"
		/>
	</button>

	{#if showInfo}
		<p class="mt-2">
			To start a conversation with another node you need to know it's pubkey. You can discover
			pubkeys on a lightning network explorer such as <Link
				external
				href="https://amboss.space/"
				title="amboss.space"
			/> or <Link external href="https://mempool.space/lightning" title="mempool.space" />.
		</p>
	{/if}
</form>
