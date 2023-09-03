<script lang="ts">
	import { activeConversation, appView, conversations, innerWidth } from '$lib/store';
	import { AppViewState } from '$lib/types';
	import { formatTimestamp, shortenLatestMessage, shortenPubkey } from '$lib/utils';
	import { AddConversationButton, Avatar } from 'comp';
	import { flip } from 'svelte/animate';
</script>

{#if $conversations.length}
	<div class="space-y-1 pb-[88px]">
		{#each $conversations as c (c)}
			<button
				animate:flip={{ duration: 400 }}
				on:click={() => {
					$activeConversation = c.pubkey;
					$appView = AppViewState.Convo;
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

				<div>
					{#if c.lastUpdate}
						<h4 class="text-xs">
							{formatTimestamp(c.lastUpdate).date}
							<br />
							{formatTimestamp(c.lastUpdate).time}
						</h4>
					{/if}
				</div>
			</button>
		{/each}
	</div>
{:else}
	<h1 class="press-start text-center leading-10 text-header">
		Start a conversation to begin chatting.
	</h1>
{/if}

<AddConversationButton />
