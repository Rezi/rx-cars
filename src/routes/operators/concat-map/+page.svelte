<script>
	import ConcatMap from '../../../examples/ConcatMap.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<ConcatMap {width} {height} />
</Wrap>

<style>
</style>
