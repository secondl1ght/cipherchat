<script lang="ts">
	import { clearUnread } from '$lib/chat';
</script>

<div
	on:click={clearUnread}
	on:mouseenter={clearUnread}
	on:mouseleave={clearUnread}
	class="h-full w-full"
/>
