<script lang="ts">
	import {
		activeConversation,
		activeMenu,
		convoState,
		messageHistory,
		messages,
		scrollDiv
	} from '$lib/store';
	import { ChatWindow, ConvoNav, MessageInfo, Node } from 'comp';
	import { blur } from 'svelte/transition';

	const handleScroll = () => {
		if (
			$scrollDiv.scrollTop === 0 &&
			$messages.length === $messageHistory &&
			$convoState === 'CHAT'
		) {
			$messageHistory = $messageHistory + 25;
		}

		if ($activeMenu) {
			$activeMenu.hide();
		}
	};
</script>

<section class="relative h-full w-full">
	{#if $activeConversation}
		<div
			on:scroll={handleScroll}
			bind:this={$scrollDiv}
			class="hide-scroll h-full w-full overflow-y-auto"
		>
			<ConvoNav />

			<div class="p-4">
				{#if $convoState === 'CHAT'}
					<div class="w-full">
						<ChatWindow />
					</div>
				{:else if $convoState === 'NODE'}
					<div in:blur={{ amount: 10 }} class="w-full">
						<Node />
					</div>
				{:else if $convoState === 'MESSAGE'}
					<div in:blur={{ amount: 10 }} class="w-full">
						<MessageInfo />
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<div>
				<img src="/images/logo.png" alt="logo" />
				<h1 class="mt-8 text-center text-xl uppercase md:text-2xl lg:text-3xl">CIPHERCHAT</h1>
			</div>
		</div>
	{/if}
</section>
