<script>
	import Map from '../../../examples/Map.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Map {width} {height} />
</Wrap>

<style>
</style>
