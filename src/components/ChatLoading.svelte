<script lang="ts">
	import { LoadingBars, Wrapper } from 'comp';

	const firstSyncComplete = localStorage.getItem('firstSyncComplete');
</script>

<Wrapper>
	<div class="center-fixed w-full space-y-4 p-4">
		<LoadingBars />
		<h1 class="press-start text-center text-header">Syncing messages...</h1>
		{#if !firstSyncComplete}
			<p class="text-center text-xs font-semibold text-body">
				(This can take a few minutes during the initial sync.)
			</p>
		{/if}
	</div>
</Wrapper>
