<script lang="ts">
	import { lnc } from '$lib/lnc';
	import { userAlias, userAvatar, userColor, userPubkey } from '$lib/store';
	import { errorToast, shortenPubkey } from '$lib/utils';
	import type { lnrpc } from '@lightninglabs/lnc-web';
	import { Avatar, ChannelStatus, CopyButton, Link, RowItem, SyncPing } from 'comp';
	import { onMount } from 'svelte';

	let nodeInfo: lnrpc.GetInfoResponse;
	let version = '';

	onMount(async () => {
		try {
			nodeInfo = await lnc.lnd.lightning.getInfo();
			version = nodeInfo.version.split('=')[1];
		} catch (error) {
			console.log(error);
			errorToast('Could not fetch node information, please try again.');
		}
	});
</script>

<div class="space-y-4">
	<div class="mx-auto w-fit">
		<Avatar
			pubkey={$userPubkey}
			alias={$userAlias}
			color={$userColor}
			avatar={$userAvatar}
			size="w-20 h-20"
			style="cursor-default"
			withButton
		/>
	</div>

	<h1 class="press-start break-all text-center text-header md:text-lg">
		{$userAlias || shortenPubkey($userPubkey)}
	</h1>

	<ul class="space-y-4">
		<RowItem title="Pubkey">
			<p class="flex items-center space-x-2">
				<CopyButton text={$userPubkey} width="16" height="16" />
				<span class="inline-block">
					{shortenPubkey($userPubkey)}
				</span>
			</p>
		</RowItem>

		<RowItem title="Color">
			<p style:color={$userColor}>{$userColor}</p>
		</RowItem>

		<RowItem title="Channels">
			<div class="flex items-center space-x-4">
				<ChannelStatus color="bg-success" channels={nodeInfo?.numActiveChannels} title="Active" />
				<ChannelStatus color="bg-warning" channels={nodeInfo?.numPendingChannels} title="Pending" />
				<ChannelStatus color="bg-error" channels={nodeInfo?.numInactiveChannels} title="Inactive" />
			</div>
		</RowItem>

		<RowItem title="Peers">
			<p class={nodeInfo ? 'cursor-auto' : 'cursor-wait'}>{nodeInfo?.numPeers ?? '-'}</p>
		</RowItem>

		<RowItem title="Synced to Graph">
			<SyncPing synced={nodeInfo?.syncedToGraph} type="GRAPH" />
		</RowItem>

		<RowItem title="Synced to Chain">
			<SyncPing synced={nodeInfo?.syncedToChain} type="CHAIN" />
		</RowItem>

		<RowItem title="Block Height">
			{#if nodeInfo}
				<Link
					external
					href="https://mempool.space/block/{nodeInfo.blockHash}"
					title={nodeInfo.blockHeight.toString()}
				/>
			{:else}
				<p class="cursor-wait">-</p>
			{/if}
		</RowItem>

		<RowItem title="LND Version">
			{#if nodeInfo && version}
				<Link
					external
					href="https://github.com/lightningnetwork/lnd/releases/tag/{version}"
					title={version}
					style="whitespace-nowrap"
				/>
			{:else}
				<p class="cursor-wait">-</p>
			{/if}
		</RowItem>
	</ul>
</div>
