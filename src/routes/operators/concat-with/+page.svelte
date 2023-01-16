<script>
	import ConcatWith from '../../../examples/ConcatWith.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<ConcatWith {width} {height} />
</Wrap>

<style>
</style>
