<script lang="ts">
	import { conversations, homeScrollDiv } from '$lib/store';
	import { AddConversationButton, ConversationRow } from 'comp';
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';

	$: bookmarks = $conversations.filter((c) => c.bookmarked === 'true');
	$: regular = $conversations.filter((c) => c.bookmarked === 'false');

	onDestroy(() => ($homeScrollDiv.scrollTop = 0));
</script>

{#if $conversations.length}
	<div class="pb-[88px]">
		{#if bookmarks.length}
			<h5 class="mb-2 ml-4 font-bold text-header">Bookmarks</h5>

			<div class="space-y-1">
				{#each bookmarks as c (c)}
					<div animate:flip={{ duration: 400 }}>
						<ConversationRow {c} />
					</div>
				{/each}
			</div>

			{#if regular.length}
				<hr class="my-8 border-body" />
			{/if}
		{/if}

		<div class="space-y-1">
			{#each regular as c (c)}
				<div animate:flip={{ duration: 400 }}>
					<ConversationRow {c} />
				</div>
			{/each}
		</div>
	</div>
{:else}
	<h1 class="press-start text-center leading-10 text-header">
		Start a conversation to begin chatting.
	</h1>
{/if}

<AddConversationButton />
