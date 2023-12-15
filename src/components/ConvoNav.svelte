<script lang="ts">
	import { sendMessage } from '$lib/chat';
	import { db } from '$lib/db';
	import {
		activeConversation,
		appView,
		conversation,
		convoState,
		innerWidth,
		messagesLoading,
		scrollDiv,
		scrollDivPosition
	} from '$lib/store';
	import { AppViewState } from '$lib/types';
	import { errorToast, shortenAlias, shortenPubkey, successToast } from '$lib/utils';
	import { Avatar, Banner, Icon } from 'comp';
	import { tick } from 'svelte';
	import tippy from 'tippy.js';

	let payButton: HTMLButtonElement;
	let bookmarkButton: HTMLButtonElement;
	let blockButton: HTMLButtonElement;

	$: payButton &&
		tippy([payButton], {
			content: 'Zap'
		});

	$: bookmarkButton &&
		tippy([bookmarkButton], {
			content: 'Bookmark'
		});

	$: blockButton &&
		tippy([blockButton], {
			content: 'Block'
		});

	let showPayment = false;
	const paymentAmounts = [1000, 10000, 100000, 'Custom'];
	let selectedAmount: number | string = 1000;
	let finalAmount: number | string = 1000;
	let customAmountInput: HTMLInputElement;
	const disabledPayment = [
		'ANON',
		'03006fcf3312dae8d068ea297f58e2bd00ec1ffe214b793eda46966b6294a53ce6'
	];

	const hidePayment = () => (showPayment = false);
	$: disabledPayment.includes($activeConversation) && hidePayment();

	const toggleConvo = async () => {
		if ($convoState === 'CHAT') {
			$scrollDivPosition = $scrollDiv.scrollTop;
			$convoState = 'NODE';
		} else {
			$convoState = 'CHAT';

			if ($scrollDivPosition !== undefined) {
				await tick();
				$scrollDiv.scrollTop = $scrollDivPosition;
			}
		}
	};

	const blockNode = async () => {
		try {
			await db.transaction(
				'rw',
				db.conversations,
				async () => await db.conversations.update($activeConversation, { blocked: 'true' })
			);

			$appView = AppViewState.Home;
			$activeConversation = '';

			successToast('Node added to your blocked list.');
		} catch (error) {
			console.log(error);
			errorToast('Could not block node, please try again.');
		}
	};

	const toggleBookmark = async () => {
		try {
			let bookmarked;

			await db.transaction('rw', db.conversations, async () => {
				const convo = await db.conversations.get($activeConversation);
				if (!convo) return;

				convo.bookmarked = convo.bookmarked === 'false' ? 'true' : 'false';
				bookmarked = convo.bookmarked;

				await db.conversations.put(convo);
			});

			successToast(`Node ${bookmarked === 'true' ? 'added to' : 'removed from'} bookmarks.`);
		} catch (error) {
			console.log(error);
			errorToast('Could not toggle bookmark status, please try again.');
		}
	};

	const togglePayment = () => {
		showPayment = !showPayment;
		selectedAmount = 1000;
		finalAmount = 1000;
	};

	const amountText = (amount: number | string, innerWidth: number) => {
		switch (amount) {
			case 'Custom':
				return 'Custom';
			case 1000:
				return innerWidth > 640 ? '1000' : '1K';
			case 10000:
				return innerWidth > 640 ? '10,000' : '10K';
			case 100000:
				return innerWidth > 640 ? '100,000' : '100K';
		}
	};

	const sendPayment = () => {
		sendMessage($activeConversation, crypto.randomUUID(), Number(finalAmount));
		showPayment = false;
		$convoState = 'CHAT';
		selectedAmount = 1000;
		finalAmount = 1000;
	};

	const handleEnter = (
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (e.key === 'Enter' && finalAmount) {
			sendPayment();
		}
	};
</script>

{#if $conversation}
	<div class="sticky left-0 top-0 z-10 w-full">
		<nav
			class="grid w-full grid-cols-1 items-center justify-between border-b border-body bg-borderIn p-4 lg:flex"
		>
			<div class="mt-4 flex items-center justify-between lg:mt-0 lg:justify-start lg:gap-x-2.5">
				<button
					on:click={toggleConvo}
					class="order-last lg:order-first"
					disabled={($activeConversation === 'ANON' && $convoState !== 'MESSAGE') ||
						$messagesLoading}
					class:cursor-not-allowed={$activeConversation === 'ANON' && $convoState !== 'MESSAGE'}
				>
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
						$appView = AppViewState.Home;
						$activeConversation = '';
					}}
				>
					<Icon icon="home" style="text-header" />
				</button>

				<div class="space-x-4">
					<button
						bind:this={payButton}
						on:click={togglePayment}
						disabled={disabledPayment.includes($activeConversation)}
						class:cursor-not-allowed={disabledPayment.includes($activeConversation)}
						class:opacity-50={disabledPayment.includes($activeConversation)}
					>
						<Icon icon="cloud-lightning" style="text-header" />
					</button>

					<button bind:this={bookmarkButton} on:click={toggleBookmark}>
						<Icon icon="bookmark" style="text-header" />
					</button>

					<button
						bind:this={blockButton}
						on:click={blockNode}
						disabled={$activeConversation === 'ANON'}
						class:cursor-not-allowed={$activeConversation === 'ANON'}
						class:opacity-50={$activeConversation === 'ANON'}
					>
						<Icon icon="slash" style="text-header" />
					</button>
				</div>
			</div>
		</nav>

		{#if showPayment}
			<div
				class="flex w-full items-center justify-center gap-4 overflow-x-auto border-b border-body bg-borderOut p-2"
			>
				{#if selectedAmount === 'Custom'}
					<label for="amount" class="text-header">Send</label>
					<input
						id="amount"
						type="number"
						min="1"
						bind:value={finalAmount}
						bind:this={customAmountInput}
						on:keydown={handleEnter}
						placeholder="satoshis"
						class="h-7 w-32 border border-header bg-boxFill px-1 text-sm text-header placeholder:text-sm md:text-base md:placeholder:text-base"
					/>
				{:else}
					{#each paymentAmounts as amount}
						<button
							class="text-header transition-all {selectedAmount === amount
								? 'underline decoration-button decoration-4 underline-offset-8'
								: 'hover:underline hover:decoration-button hover:decoration-4 hover:underline-offset-8'}"
							on:click={async () => {
								selectedAmount = amount;

								if (amount === 'Custom') {
									finalAmount = '';
									await tick();
									customAmountInput.focus();
								} else {
									finalAmount = amount;
								}
							}}
						>
							{amountText(amount, $innerWidth)}
						</button>
					{/each}
				{/if}

				<button
					class="flex items-center justify-center rounded bg-button p-1.5 {!finalAmount
						? 'cursor-not-allowed opacity-50'
						: ''}"
					on:click={sendPayment}
					disabled={!finalAmount}
				>
					<Icon icon="send" style="text-header" width="20" height="20" />
				</button>
			</div>
		{/if}

		{#if $activeConversation === 'ANON'}
			<Banner
				text="Messages received from nodes that have not revealed their identity or could not be verified are shown here. You are not able to respond to these messages. 🥷"
			/>
		{:else if $activeConversation === '03006fcf3312dae8d068ea297f58e2bd00ec1ffe214b793eda46966b6294a53ce6'}
			<Banner
				text="Messages sent to this node will be displayed publicly on the Amboss billboard. 👾"
			/>
		{/if}
	</div>
{/if}

<style>
	@import 'tippy.js/dist/tippy.css';
</style>
