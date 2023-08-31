<script lang="ts">
	import { homeState } from '$lib/store';
	import { Icon } from 'comp';
</script>

<button
	on:click={() => ($homeState = 'ADD')}
	class="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded bg-button shadow-lg transition-transform duration-500 hover:-translate-y-4"
>
	<Icon icon="plus" style="text-header" />
</button>
