<script>
	import MergeMap from '../../../examples/MergeMap.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<MergeMap {width} {height} />
</Wrap>

<style>
</style>
