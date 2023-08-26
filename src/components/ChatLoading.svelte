<script lang="ts">
	import { Wrapper } from 'comp';

	const firstSyncComplete = localStorage.getItem('firstSyncComplete');
</script>

<Wrapper>
	<div class="center-fixed w-full space-y-4 p-4">
		<div class="loading-bars mx-auto h-32 w-32 bg-header" />
		<h1 class="press-start text-center text-header">Syncing node...</h1>
		{#if !firstSyncComplete}
			<p class="text-center text-xs font-semibold text-body">
				(This can take a few minutes during the initial sync.)
			</p>
		{/if}
	</div>
</Wrapper>

<style>
	.loading-bars {
		mask-image: url(data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9JzI0JyBoZWlnaHQ9JzI0JyB2aWV3Qm94PScwIDAgMjQgMjQnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHN0eWxlPi5zcGlubmVyX2h6bEt7YW5pbWF0aW9uOnNwaW5uZXJfdmM0SCAuOHMgbGluZWFyIGluZmluaXRlO2FuaW1hdGlvbi1kZWxheTotLjhzfS5zcGlubmVyX2tvR1R7YW5pbWF0aW9uLWRlbGF5Oi0uNjVzfS5zcGlubmVyX1lGMXV7YW5pbWF0aW9uLWRlbGF5Oi0uNXN9QGtleWZyYW1lcyBzcGlubmVyX3ZjNEh7MCV7eToxcHg7aGVpZ2h0OjIycHh9OTMuNzUle3k6NXB4O2hlaWdodDoxNHB4O29wYWNpdHk6LjJ9fTwvc3R5bGU+PHJlY3QgY2xhc3M9J3NwaW5uZXJfaHpsSycgeD0nMScgeT0nMScgd2lkdGg9JzYnIGhlaWdodD0nMjInLz48cmVjdCBjbGFzcz0nc3Bpbm5lcl9oemxLIHNwaW5uZXJfa29HVCcgeD0nOScgeT0nMScgd2lkdGg9JzYnIGhlaWdodD0nMjInLz48cmVjdCBjbGFzcz0nc3Bpbm5lcl9oemxLIHNwaW5uZXJfWUYxdScgeD0nMTcnIHk9JzEnIHdpZHRoPSc2JyBoZWlnaHQ9JzIyJy8+PC9zdmc+);
		mask-size: 100%;
		mask-repeat: no-repeat;
		mask-position: center;
	}
</style>
