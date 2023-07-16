<script lang="ts">
	export let width = '24';
	export let height = '24';
	export let icon: string;
	export let style = '';
</script>

<svg
	class={style}
	{width}
	{height}
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<use href="/icons/feather-sprite.svg#{icon}" />
</svg>
