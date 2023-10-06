<script>
	import { scanActive } from '$lib/store';
</script>

<div
	class="mx-auto min-h-[100dvh] w-full border-borderOut xl:w-11/12 xl:border-l-8 xl:border-r-8 {$scanActive
		? 'max-h-[100dvh] overflow-hidden'
		: ''}"
>
	<div class="min-h-[100dvh] w-full border-borderIn xl:border-l-4 xl:border-r-4">
		<slot />
	</div>
</div>
