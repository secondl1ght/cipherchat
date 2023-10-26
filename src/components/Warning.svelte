<script lang="ts">
	export let text: string;

	import { Icon } from 'comp';
</script>

<p class="mx-auto max-w-xl items-center font-bold text-warning md:flex">
	<Icon icon="alert-octagon" style="min-w-[24px] min-h-[24px] md:mr-2 mb-2 md:mb-0 mx-auto" />
	{text}
</p>
