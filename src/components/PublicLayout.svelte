<script lang="ts">
	export let heroText = 'CIPHERCHAT';

	import { BoxWrapper, Footer, Header, Hero, Wrapper } from 'comp';
</script>

<Wrapper>
	<Header />
	<main class="py-16 md:py-20">
		<Hero {heroText} />
		<BoxWrapper>
			<slot />
		</BoxWrapper>
		<h3 class="px-2 text-center text-xl md:text-2xl lg:text-3xl">Free and open-source software.</h3>
	</main>
	<Footer />
</Wrapper>
