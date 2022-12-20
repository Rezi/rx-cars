<script>
	import Delay from '../../../examples/Delay.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Delay {width} {height} />
</Wrap>

<style>
</style>
