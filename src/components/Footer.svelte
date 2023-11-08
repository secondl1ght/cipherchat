<script lang="ts">
	import { page } from '$app/stores';
	import { Link, Version } from 'comp';
	import { links } from '$lib/store';

	const linkArray = Object.entries($links);
</script>

<footer class="relative px-2 pb-8">
	<img
		src="/images/bricks/2.svg"
		alt="bricks"
		class="absolute bottom-32 left-6 hidden lg:block xl:left-20"
	/>

	<nav class="my-16 flex flex-wrap justify-center gap-8 md:gap-24">
		<Link
			href="/privacy"
			title="Privacy"
			style="text-lg md:text-xl lg:text-2xl {$page.route.id === '/privacy' ? '!text-button' : ''}"
		/>
		<Link
			href="/license"
			title="License"
			style="text-lg md:text-xl lg:text-2xl {$page.route.id === '/license' ? '!text-button' : ''}"
		/>
		<Link
			href="/donate"
			title="Donate"
			style="text-lg md:text-xl lg:text-2xl {$page.route.id === '/donate' ? '!text-button' : ''}"
		/>
	</nav>

	<div class="mb-8 flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm">
		{#each linkArray as link, index}
			<Link title={link[0]} href={link[1]} external />
			{#if index !== linkArray.length - 1}
				\
			{/if}
		{/each}
	</div>

	<Version style="text-center text-xs md:text-sm" />

	<img
		src="/images/bricks/3.svg"
		alt="bricks"
		class="absolute bottom-32 right-6 hidden lg:block xl:right-20"
	/>
</footer>
