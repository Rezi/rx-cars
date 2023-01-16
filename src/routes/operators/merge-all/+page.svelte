<script>
	import MergeAll from '../../../examples/MergeAll.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<MergeAll {width} {height} />
</Wrap>

<style>
</style>
