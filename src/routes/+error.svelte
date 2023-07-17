<script lang="ts">
	import { page } from '$app/stores';
	import { Wrapper, Header, Hero, FormWrapper, Button, Icon, Footer } from 'comp';

	let loading = false;
</script>

<Wrapper>
	<Header />
	<main class="py-16 md:py-20">
		<Hero />
		<FormWrapper>
			<h2
				class="press-start mx-auto mb-8 max-w-4xl text-center text-xl leading-10 text-header md:text-2xl md:!leading-[50px] lg:mb-16 lg:text-3xl xl:text-4xl"
			>
				{$page.status}: {$page.error?.message || 'Error'}
			</h2>

			<Button
				click={() => {
					loading = true;
					location.reload();
				}}
				title="Refresh"
				disabled={loading}
				{loading}
				loadingText="Refreshing..."
			/>

			<div class="mt-8 flex justify-center lg:mt-16">
				<a
					href="https://github.com/secondl1ght/cipherchat/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title="
					target="_blank"
					rel="noreferrer"
					class="flex items-center text-header transition-colors hover:text-button"
				>
					Report a bug <Icon icon="alert-triangle" style="ml-3" />
				</a>
			</div>
		</FormWrapper>
		<h3 class="px-2 text-center text-xl md:text-2xl lg:text-3xl">Free and open-source software.</h3>
	</main>
	<Footer />
</Wrapper>
