<script>
	import ConcateMap from '../../../examples/ConcatMap.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<ConcateMap {width} {height} />
</Wrap>

<style>
</style>
