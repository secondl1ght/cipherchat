<script lang="ts">
	import { chatInputHeight, messages, scrollDiv } from '$lib/store';
	import { Message } from 'comp';
</script>

{#if $scrollDiv}
	<div style:padding-bottom={`${$chatInputHeight}px`} class="h-full w-full space-y-4 md:px-4">
		{#each $messages as message}
			<Message {message} />
		{/each}
	</div>
{/if}
