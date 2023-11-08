<script lang="ts">
	import { page } from '$app/stores';
	import { Link } from 'comp';
</script>

<header class="px-2 py-8">
	<nav class="flex flex-wrap justify-center gap-8 md:gap-24">
		<Link
			href="/"
			title="Home"
			style="text-lg md:text-xl lg:text-2xl {$page.route.id === '/' ? '!text-button' : ''}"
		/>
		<Link
			href="/faq"
			title="FAQ"
			style="text-lg md:text-xl lg:text-2xl  {$page.route.id === '/faq' ? '!text-button' : ''}"
		/>
	</nav>
</header>
