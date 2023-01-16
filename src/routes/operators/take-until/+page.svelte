<script>
	import TakeUntil from '../../../examples/TakeUntil.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<TakeUntil {width} {height} />
</Wrap>

<style>
</style>
