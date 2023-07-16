<script lang="ts">
	export let click: () => void;
	export let style = '';
	export let title: string;
	export let disabled = false;
	export let loading = false;
	export let loadingText = '';
</script>

<div class="flex justify-center">
	<button
		type="button"
		on:click={click}
		class="{style} h-16 w-full bg-button text-lg text-header md:h-24 md:w-96 md:text-xl lg:text-2xl {disabled
			? 'cursor-not-allowed opacity-50'
			: ''}"
		disabled={disabled || loading}
	>
		{#if loading}
			<div class="flex items-center justify-center">
				<svg
					class="mr-3 h-5 w-5 animate-spin text-header"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				{loadingText}
			</div>
		{:else}
			{title}
		{/if}
	</button>
</div>
