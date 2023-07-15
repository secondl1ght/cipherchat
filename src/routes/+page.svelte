<script lang="ts">
	import { lnc } from '$lib/lnc';
	import { Chat, Wrapper, Header, Hero, Login, Connect, Footer } from 'comp';
</script>

{#if lnc.isConnected}
	<Chat />
{:else}
	<Wrapper>
		<Header />
		<main class="py-16 md:py-20">
			<Hero />
			{#if lnc.credentials.isPaired}
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
