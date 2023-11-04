<script lang="ts">
	import { Icon } from 'comp';

	export let question: string;

	const hash = question
		.replaceAll(' ', '-')
		.replaceAll('?', '')
		.replaceAll(',', '')
		.replaceAll("'", '')
		.toLowerCase();

	let showIcon = false;
</script>

<li id={hash}>
	<div class="mb-2 flex items-center space-x-4">
		<a
			href={'#' + hash}
			class="inline-block"
			on:mouseenter={() => (showIcon = true)}
			on:mouseleave={() => (showIcon = false)}
		>
			<h4 class="text-header">
				{question}
			</h4>
		</a>

		{#if showIcon}
			<Icon icon="link-2" style="min-w-[16px] min-h-[16px]" width="16" height="16" />
		{/if}
	</div>

	<p><slot /></p>
</li>
