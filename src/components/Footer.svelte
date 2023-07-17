<script lang="ts">
	import { Link } from 'comp';
	import { page } from '$app/stores';
	import { PUBLIC_COMMIT } from '$env/static/public';
</script>

<footer class="relative space-y-16 px-2 pb-8">
	<img
		src="/images/bricks/2.svg"
		alt="bricks"
		class="absolute bottom-20 left-6 hidden lg:block xl:left-20"
	/>

	<nav class="flex flex-wrap justify-center gap-8 md:gap-24">
		<Link
			href="/privacy"
			title="Privacy"
			style="text-lg md:text-xl lg:text-2xl {$page.route.id === '/privacy' ? 'text-button' : ''}"
		/>
		<Link
			href="/license"
			title="License"
			style="text-lg md:text-xl lg:text-2xl {$page.route.id === '/license' ? 'text-button' : ''}"
		/>
		<Link
			href="/donate"
			title="Donate"
			style="text-lg md:text-xl lg:text-2xl {$page.route.id === '/donate' ? 'text-button' : ''}"
		/>
	</nav>

	<p class="text-center text-xs md:text-sm">
		cipherchat.app (v0.0.1) [<Link
			href="https://github.com/secondl1ght/cipherchat/commit/{PUBLIC_COMMIT}"
			title={PUBLIC_COMMIT}
			external
		/>]
	</p>

	<img
		src="/images/bricks/3.svg"
		alt="bricks"
		class="absolute bottom-20 right-6 hidden lg:block xl:right-20"
	/>
</footer>
