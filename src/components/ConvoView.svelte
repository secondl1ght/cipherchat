<script lang="ts">
	import { clearUnread } from '$lib/chat';
	import {
		activeConversation,
		activeMenu,
		convoState,
		messageHistory,
		messages,
		messagesLoading,
		scrollDiv,
		scrollDivPosition,
		showScrollButton
	} from '$lib/store';
	import { ChatWindow, ConvoNav, MessageInfo, Node } from 'comp';
	import { blur } from 'svelte/transition';

	const handleScroll = () => {
		if ($scrollDiv.scrollHeight - $scrollDiv.scrollTop - $scrollDiv.clientHeight === 0) {
			clearUnread();
		}

		if ($activeMenu) {
			$activeMenu.hide();
		}

		if ($scrollDiv.scrollHeight - $scrollDiv.scrollTop - $scrollDiv.clientHeight > 1) {
			$showScrollButton = true;
		} else {
			$showScrollButton = false;
		}

		if (
			$scrollDiv.scrollTop === 0 &&
			$messages.length === $messageHistory &&
			$convoState === 'CHAT' &&
			!$messagesLoading
		) {
			$scrollDivPosition = $scrollDiv.scrollHeight;
			$messagesLoading = true;
			setTimeout(() => {
				if ($messagesLoading) {
					$messageHistory = $messageHistory + 25;
				}
			}, 2100);
		}
	};
</script>

<section class="relative h-full w-full">
	{#if $activeConversation}
		<div
			on:scroll={handleScroll}
			bind:this={$scrollDiv}
			class="hide-scroll h-full w-full {$messagesLoading ? 'overflow-y-hidden' : 'overflow-y-auto'}"
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
