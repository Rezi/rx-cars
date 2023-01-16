<script>
	import Skip from '../../../examples/Skip.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Skip {width} {height} />
</Wrap>

<style>
</style>
