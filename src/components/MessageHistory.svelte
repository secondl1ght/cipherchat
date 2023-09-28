<script lang="ts">
	export let loading: boolean;

	import { firstUpdate } from '$lib/store';
	import { InfoTooltip } from 'comp';
	import format from 'date-fns/format';

	const today = format(new Date(), 'yyyy-MM-dd');
</script>

<label for="history" class="flex items-center text-lg font-bold text-header md:text-xl lg:text-2xl">
	Message History <InfoTooltip
		text="How far back you want to sync messages from your node. Selecting a more recent date will speed up the initial loading time. The default is 1 month history from today."
	/>
</label>
<input
	id="history"
	name="history"
	type="date"
	required
	disabled={loading}
	bind:value={$firstUpdate}
	max={today}
	class="mb-10 mt-2 block h-16 w-full border-2 border-b-boxBottom border-l-boxTop border-r-boxBottom border-t-boxTop bg-boxFill px-2 text-xs text-header placeholder:text-xs md:text-base md:placeholder:text-base"
/>

<style>
	::-webkit-calendar-picker-indicator {
		filter: invert(1);
		cursor: pointer;
	}
</style>
