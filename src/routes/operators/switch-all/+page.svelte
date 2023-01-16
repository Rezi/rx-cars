<script>
	import SwitchAll from '../../../examples/SwitchAll.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<SwitchAll {width} {height} />
</Wrap>

<style>
</style>
