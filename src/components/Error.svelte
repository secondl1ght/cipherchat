<script lang="ts">
	import { error } from '$lib/store';
	import { Button, Icon, PublicLayout } from 'comp';

	let loading = false;
</script>

<PublicLayout heroText="ERROR">
	<h2
		class="press-start mb-8 text-center text-xl leading-10 text-header md:text-2xl md:!leading-[50px] lg:mb-16 lg:text-3xl xl:text-4xl"
	>
		{$error.status}: {$error.message}
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
</PublicLayout>
