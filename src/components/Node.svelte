<script lang="ts">
	import { bufferHexToBase64 } from '$lib/buffer';
	import { db } from '$lib/db';
	import { activeConversation, conversation, lnc } from '$lib/store';
	import { errorToast, formatNumber, shortenPubkey, successToast } from '$lib/utils';
	import type { lnrpc } from '@lightninglabs/lnc-web';
	import { Avatar, CopyButton, InfoTooltip, RowItem, SharedChannel } from 'comp';
	import { onMount } from 'svelte';

	let nodeInfo: lnrpc.NodeInfo;
	let channels: lnrpc.Channel[] = [];

	let loading = true;

	let charLimit = $conversation.charLimit;

	onMount(async () => {
		try {
			await Promise.all([
				$lnc.lnd.lightning.getNodeInfo({
					pubKey: $activeConversation,
					includeChannels: false
				}),
				$lnc.lnd.lightning.listChannels({
					peer: bufferHexToBase64($activeConversation)
				})
			]).then((values) => {
				nodeInfo = values[0];
				channels = values[1].channels;
			});

			loading = false;
		} catch (error) {
			console.log(error);
			errorToast('Could not fetch node information, please try again.');
		}
	});
</script>

{#if $conversation}
	<div class="space-y-4">
		<div class="mx-auto w-fit">
			<Avatar
				pubkey={$conversation.pubkey}
				alias={$conversation.alias}
				color={$conversation.color}
				avatar={$conversation.avatar}
				size="w-20 h-20"
				style="cursor-default"
			/>
		</div>

		<h1 class="press-start break-all text-center text-header md:text-lg">
			{$conversation.alias || shortenPubkey($conversation.pubkey)}
		</h1>

		<ul class="space-y-4">
			<RowItem title="Pubkey">
				<p class="flex items-center space-x-2">
					<CopyButton text={$conversation.pubkey} width="16" height="16" />
					<span class="inline-block">
						{shortenPubkey($conversation.pubkey)}
					</span>
				</p>
			</RowItem>

			<RowItem title="Color">
				<p style:color={$conversation.color}>{$conversation.color}</p>
			</RowItem>

			<RowItem title="Channels">
				<p class={nodeInfo ? 'cursor-auto' : 'cursor-wait'}>
					{nodeInfo?.numChannels !== undefined ? formatNumber(nodeInfo.numChannels) : '-'}
				</p>
			</RowItem>

			<RowItem title="Capacity">
				<p class="whitespace-nowrap {nodeInfo ? 'cursor-auto' : 'cursor-wait'}">
					{nodeInfo?.totalCapacity !== undefined
						? formatNumber(Number(nodeInfo.totalCapacity))
						: '-'} sats
				</p>
			</RowItem>

			<RowItem title="Last Update">
				<p class="whitespace-nowrap {nodeInfo ? 'cursor-auto' : 'cursor-wait'}">
					{nodeInfo?.node?.lastUpdate !== undefined
						? new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(
								new Date(nodeInfo.node.lastUpdate * 1000)
						  )
						: '-'}
				</p>
			</RowItem>

			<RowItem title="Addresses">
				{#if nodeInfo?.node}
					<ol class="space-y-2">
						{#each nodeInfo.node.addresses as address}
							<li class="flex items-center space-x-2">
								<CopyButton text={address.addr} width="16" height="16" />
								<span class="inline-block">
									{address.addr}
								</span>
							</li>
						{/each}
					</ol>
				{:else}
					<p class="cursor-wait">-</p>
				{/if}
			</RowItem>

			<RowItem title="Char Limit" label="char-limit">
				<div class="flex items-center">
					<InfoTooltip
						style="mr-3 text-header"
						text="There are limitations to the size of messages that can be sent over the lightning network, depending on the length of the route."
					/>

					<div>
						<p class="text-center font-bold">{charLimit}</p>

						<input
							bind:value={charLimit}
							on:change={async () => {
								try {
									await db.transaction('rw', db.conversations, async () => {
										await db.conversations.update($activeConversation, { charLimit });
									});

									successToast('Setting updated.');
								} catch (error) {
									console.log(error);
									errorToast('Could not update char limit, please try again.');
								}
							}}
							type="range"
							id="char-limit"
							name="char-limit"
							min="100"
							max="1000"
							step="100"
							class="cursor-pointer accent-button"
						/>
					</div>
				</div>
			</RowItem>
		</ul>

		<hr class="border-header" />

		<div class="space-y-4">
			<h2 class="text-center text-header">Shared Channels</h2>

			{#if channels.length}
				<div class="space-y-4">
					{#each channels as channel}
						<SharedChannel {channel} />
					{/each}
				</div>
			{:else if loading}
				<p class="cursor-wait text-center">Loading...</p>
			{:else}
				<p class="text-center">You don't have any channels open with this node.</p>
			{/if}
		</div>
	</div>
{/if}
