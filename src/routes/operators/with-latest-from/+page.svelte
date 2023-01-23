<script>
	import WithLatestFrom from '../../../examples/WithLatestFrom.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<WithLatestFrom {width} {height} />
</Wrap>

<style>
</style>
