<script lang="ts">
	import { lnc } from '$lib/lnc';
	import { userAlias, userAvatar, userColor, userPubkey } from '$lib/store';
	import { shortenPubkey } from '$lib/utils';
	import type { lnrpc } from '@lightninglabs/lnc-web';
	import { Avatar, ChannelStatus, CopyButton, Link, ProfileItem, SyncPing } from 'comp';
	import { onMount } from 'svelte';

	let nodeInfo: lnrpc.GetInfoResponse;
	let version = '';

	onMount(async () => {
		nodeInfo = await lnc.lnd.lightning.getInfo();
		version = nodeInfo.version.split('=')[1];
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
		<ProfileItem title="Pubkey">
			<p class="break-all">
				{$userPubkey}
				<CopyButton text={$userPubkey} width="16" height="16" />
			</p>
		</ProfileItem>

		<ProfileItem title="Color">
			<p style:color={$userColor}>{$userColor}</p>
		</ProfileItem>

		{#if nodeInfo}
			<ProfileItem title="Channels">
				<div class="flex items-center space-x-4">
					<ChannelStatus color="bg-success" channels={nodeInfo.numActiveChannels} title="Active" />
					<ChannelStatus
						color="bg-warning"
						channels={nodeInfo.numPendingChannels}
						title="Pending"
					/>
					<ChannelStatus
						color="bg-error"
						channels={nodeInfo.numInactiveChannels}
						title="Inactive"
					/>
				</div>
			</ProfileItem>

			<ProfileItem title="Peers">
				<p>{nodeInfo.numPeers}</p>
			</ProfileItem>

			<ProfileItem title="Synced to Graph">
				<SyncPing synced={nodeInfo.syncedToGraph} type="GRAPH" />
			</ProfileItem>

			<ProfileItem title="Synced to Chain">
				<SyncPing synced={nodeInfo.syncedToChain} type="CHAIN" />
			</ProfileItem>

			<ProfileItem title="Block Height">
				<Link
					external
					href="https://mempool.space/block/{nodeInfo.blockHash}"
					title={nodeInfo.blockHeight.toString()}
				/>
			</ProfileItem>

			<ProfileItem title="LND Version">
				<Link
					external
					href="https://github.com/lightningnetwork/lnd/releases/tag/{version}"
					title={version}
					style="break-all"
				/>
			</ProfileItem>
		{:else}
			{#each Array(6) as _skeleton}
				<li class="h-6 w-full animate-pulse bg-borderIn/75" />
			{/each}
		{/if}
	</ul>
</div>
