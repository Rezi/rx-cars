<script>
	import Filter from '../../../examples/Filter.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Filter {width} {height} />
</Wrap>

<style>
</style>
