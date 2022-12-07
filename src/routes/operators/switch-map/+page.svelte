<script>
	import SwitchMap from '../../../examples/SwitchMap.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<SwitchMap {width} {height} />
</Wrap>

<style>
</style>
