<script lang="ts">
	export let c: Conversation;

	import { clearUnread, statusIcon } from '$lib/chat';
	import {
		LNRPC,
		activeConversation,
		appView,
		conversationLoading,
		convoState,
		innerWidth,
		messageHistory,
		scrollDivPosition
	} from '$lib/store';
	import { AppViewState, type Conversation } from '$lib/types';
	import { breakAll, formatTimestamp, shortenLatestMessage, shortenPubkey } from '$lib/utils';
	import { Avatar, Icon, LoadingPing } from 'comp';
	import { tick } from 'svelte';
</script>

<button
	on:click={async () => {
		$conversationLoading = true;
		await tick();
		$scrollDivPosition = undefined;
		$messageHistory = 25;
		$activeConversation = c.pubkey;
		$convoState = 'CHAT';
		$appView = AppViewState.Convo;
		clearUnread();
	}}
	class="flex w-full items-center justify-between space-x-2.5 p-4 text-left {$activeConversation ===
	c.pubkey
		? 'bg-borderIn'
		: 'bg-borderOut hover:bg-borderIn'}"
	disabled={$activeConversation === c.pubkey}
>
	<div class="flex items-center space-x-2.5">
		<Avatar pubkey={c.pubkey} alias={c.alias} color={c.color} avatar={c.avatar} />

		<div>
			<h2
				class="text-sm font-bold text-header"
				class:break-all={c.alias ? breakAll(c.alias, 12) : true}
			>
				{c.alias || shortenPubkey(c.pubkey)}
			</h2>
			{#if c.latestMessage}
				<h3 class="text-sm" class:break-all={breakAll(c.latestMessage, 12)}>
					{shortenLatestMessage(
						c.latestMessage,
						$innerWidth > 1536 ? 60 : $innerWidth > 475 ? 50 : 40
					)}
				</h3>
			{/if}
		</div>
	</div>

	<div class="flex items-center space-x-2.5">
		{#if c.latestMessageStatus}
			{#if c.latestMessageStatus === $LNRPC.Payment_PaymentStatus.IN_FLIGHT}
				<LoadingPing color="bg-header" size="w-[18px] h-[18px]" />
			{:else}
				<Icon icon={statusIcon(c.latestMessageStatus)} style="text-header" width="18" height="18" />
			{/if}
		{/if}

		<div class="space-y-1">
			{#if c.lastUpdate}
				<h4 class="whitespace-nowrap text-right text-xs">
					{formatTimestamp(c.lastUpdate).date}
					<br />
					{formatTimestamp(c.lastUpdate).time}
				</h4>
			{/if}
			{#if c.unread}
				<div
					class="ml-auto flex h-fit w-fit items-center justify-center whitespace-nowrap rounded-sm bg-button px-1.5 py-px text-xs font-bold text-header"
				>
					{c.unread <= 9999 ? c.unread : '9999+'}
				</div>
			{/if}
		</div>
	</div>
</button>
