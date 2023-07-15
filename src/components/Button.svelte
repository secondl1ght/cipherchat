<script lang="ts">
	export let click: () => void;
	export let style = '';
	export let title: string;
</script>

<div class="flex justify-center">
	<button
		on:click={click}
		class="{style} h-16 w-full bg-button text-lg text-header md:h-24 md:w-96 md:text-xl lg:text-2xl"
		>{title}</button
	>
</div>
