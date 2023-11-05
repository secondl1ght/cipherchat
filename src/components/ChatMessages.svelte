<script lang="ts">
	import {
		chatInputHeight,
		conversationLoading,
		messageHistory,
		messages,
		messagesLoading,
		scrollBottom,
		scrollDiv
	} from '$lib/store';
	import { Message } from 'comp';
</script>

{#if $scrollDiv}
	<div
		style:padding-bottom={`${$chatInputHeight}px`}
		class="h-full w-full space-y-4 md:px-4 {$conversationLoading ? 'invisible' : 'visible'}"
	>
		{#if $messagesLoading}
			<div class="loading-dots mx-auto h-10 w-10 bg-header" />
		{:else if $messages.length !== $messageHistory && $messages.length > 25}
			<p class="text-center text-xs font-bold">End of message history. 😸</p>
		{/if}

		{#each $messages as message}
			<Message {message} />
		{/each}

		<span bind:this={$scrollBottom} />
	</div>
{/if}

<style>
	.loading-dots {
		mask-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjQnIGhlaWdodD0nMjQnIHZpZXdCb3g9JzAgMCAyNCAyNCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48c3R5bGU+LnNwaW5uZXJfcU04M3thbmltYXRpb246c3Bpbm5lcl84SFFHIDEuMDVzIGluZmluaXRlfS5zcGlubmVyX29YUHJ7YW5pbWF0aW9uLWRlbGF5Oi4xc30uc3Bpbm5lcl9aVExme2FuaW1hdGlvbi1kZWxheTouMnN9QGtleWZyYW1lcyBzcGlubmVyXzhIUUd7MCUsNTcuMTQle2FuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246Y3ViaWMtYmV6aWVyKDAuMzMsLjY2LC42NiwxKTt0cmFuc2Zvcm06dHJhbnNsYXRlKDApfTI4LjU3JXthbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOmN1YmljLWJlemllcigwLjMzLDAsLjY2LC4zMyk7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTZweCl9MTAwJXt0cmFuc2Zvcm06dHJhbnNsYXRlKDApfX08L3N0eWxlPjxjaXJjbGUgY2xhc3M9J3NwaW5uZXJfcU04MycgY3g9JzQnIGN5PScxMicgcj0nMycvPjxjaXJjbGUgY2xhc3M9J3NwaW5uZXJfcU04MyBzcGlubmVyX29YUHInIGN4PScxMicgY3k9JzEyJyByPSczJy8+PGNpcmNsZSBjbGFzcz0nc3Bpbm5lcl9xTTgzIHNwaW5uZXJfWlRMZicgY3g9JzIwJyBjeT0nMTInIHI9JzMnLz48L3N2Zz4=);
		mask-size: 100%;
		mask-repeat: no-repeat;
		mask-position: center;
	}
</style>
