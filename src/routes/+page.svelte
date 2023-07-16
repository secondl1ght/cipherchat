<script lang="ts">
	import { connected, paired } from '$lib/store';
	import { browser } from '$app/environment';
	import { Chat, Wrapper, Header, Hero, Login, Connect, Footer } from 'comp';
</script>

{#if browser}
	{#if $connected}
		<Chat />
	{:else}
		<Wrapper>
			<Header />
			<main class="py-16 md:py-20">
				<Hero />
				{#if $paired}
					<Login />
				{:else}
					<Connect />
				{/if}
				<h3 class="px-2 text-center text-xl md:text-2xl lg:text-3xl">
					Free and open-source software.
				</h3>
			</main>
			<Footer />
		</Wrapper>
	{/if}
{/if}
