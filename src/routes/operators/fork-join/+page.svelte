<script>
	import ForkJoin from '../../../examples/ForkJoin.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<ForkJoin {width} {height} />
</Wrap>

<style>
</style>
