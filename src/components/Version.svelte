<script>
	export let style = '';

	import { PUBLIC_COMMIT, PUBLIC_VERSION } from '$env/static/public';
	import { Link } from 'comp';
</script>

<p class={style}>
	cipherchat.app ({PUBLIC_VERSION}) [<Link
		href="https://github.com/secondl1ght/cipherchat/commit/{PUBLIC_COMMIT}"
		title={PUBLIC_COMMIT}
		external
	/>]
</p>
