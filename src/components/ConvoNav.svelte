<script lang="ts">
	import { clearUnread } from '$lib/chat';
	import { appView, conversation, convoState, innerWidth, messageHistory } from '$lib/store';
	import { AppViewState } from '$lib/types';
	import { shortenAlias, shortenPubkey } from '$lib/utils';
	import { Avatar, Icon } from 'comp';

	const toggleConvo = () => {
		if ($convoState === 'CHAT') {
			$convoState = 'NODE';
		} else {
			$convoState = 'CHAT';
		}
	};
</script>

{#if $conversation}
	<nav
		class="sticky left-0 top-0 z-10 grid w-full grid-cols-1 items-center justify-between border-b border-body bg-borderIn p-4 lg:flex"
	>
		<div class="mt-4 flex items-center justify-between lg:mt-0 lg:justify-start lg:gap-x-2.5">
			<button on:click={toggleConvo} class="order-last lg:order-first">
				{#if $convoState === 'CHAT'}
					<Avatar
						pubkey={$conversation.pubkey}
						alias={$conversation.alias}
						color={$conversation.color}
						avatar={$conversation.avatar}
					/>
				{:else}
					<Icon
						icon="arrow-left-circle"
						style="text-header"
						width={$innerWidth > 1024 ? '48' : '40'}
						height={$innerWidth > 1024 ? '48' : '40'}
					/>
				{/if}
			</button>

			<h1 class="break-all text-sm font-bold text-header lg:text-base">
				{shortenAlias(
					$conversation.alias,
					$innerWidth > 1536
						? 80
						: $innerWidth > 1280
						? 60
						: $innerWidth > 1024
						? 35
						: $innerWidth > 768
						? 70
						: $innerWidth > 640
						? 60
						: $innerWidth > 475
						? 40
						: $innerWidth > 300
						? 20
						: 17
				) || shortenPubkey($conversation.pubkey)}
			</h1>
		</div>

		<div class="order-first flex justify-between lg:order-last lg:block">
			<button
				class="lg:hidden"
				on:click={() => {
					$messageHistory = 25;
					$appView = AppViewState.Home;
					clearUnread();
				}}
			>
				<Icon icon="home" style="text-header" />
			</button>

			<div class="space-x-4">
				<button on:click={() => {}}>
					<Icon icon="zap" style="text-header" />
				</button>

				<button on:click={() => {}}>
					<Icon icon="bookmark" style="text-header" />
				</button>

				<button on:click={() => {}}>
					<Icon icon="slash" style="text-header" />
				</button>
			</div>
		</div>
	</nav>
{/if}
