<script lang="ts">
	export let title: string;
</script>

<li class="flex items-center justify-between space-x-8">
	<p class="whitespace-nowrap text-header">{title}:</p>
	<slot />
</li>
