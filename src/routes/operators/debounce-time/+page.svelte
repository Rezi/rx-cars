<script>
	import DebounceTime from '../../../examples/DebounceTime.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<DebounceTime {width} {height} />
</Wrap>

<style>
</style>
