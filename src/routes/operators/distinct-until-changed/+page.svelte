<script>
	import DistinctUntilChanged from '../../../examples/DistinctUntilChanged.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<DistinctUntilChanged {width} {height} />
</Wrap>

<style>
</style>
