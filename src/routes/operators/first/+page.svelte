<script>
	import First from '../../../examples/First.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<First {width} {height} />
</Wrap>

<style>
</style>
