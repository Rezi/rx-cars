<script>
	import DistinctUntilKeyChanged from '../../../examples/DistinctUntilKeyChanged.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<DistinctUntilKeyChanged {width} {height} />
</Wrap>

<style>
</style>
