<script>
	import ConcatAll from '../../../examples/ConcatAll.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<ConcatAll {width} {height} />
</Wrap>

<style>
</style>
