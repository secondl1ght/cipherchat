<script lang="ts">
	export let c: Conversation;

	import { clearUnread } from '$lib/chat';
	import { activeConversation, appView, convoState, innerWidth, messageHistory } from '$lib/store';
	import { AppViewState, type Conversation } from '$lib/types';
	import { formatTimestamp, shortenLatestMessage, shortenPubkey } from '$lib/utils';
	import { lnrpc } from '@lightninglabs/lnc-web';
	import { Avatar, Icon } from 'comp';

	const statusIcon = () => {
		switch (c.latestMessageStatus) {
			case lnrpc.Payment_PaymentStatus.IN_FLIGHT:
				return 'loader';
			case lnrpc.Payment_PaymentStatus.SUCCEEDED:
				return 'check-circle';
			case lnrpc.Payment_PaymentStatus.FAILED:
				return 'x-circle';
			default:
				return 'alert-circle';
		}
	};
</script>

<button
	on:click={() => {
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
>
	<div class="flex items-center space-x-2.5">
		<Avatar pubkey={c.pubkey} alias={c.alias} color={c.color} avatar={c.avatar} />

		<div>
			<h2 class="break-all text-sm font-bold text-header">
				{c.alias || shortenPubkey(c.pubkey)}
			</h2>
			{#if c.latestMessage}
				<h3 class="break-all text-sm">
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
			<Icon icon={statusIcon()} style="text-header" width="18" height="18" />
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
