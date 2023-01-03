<script>
	import Distinct from '../../../examples/Distinct.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Distinct {width} {height} />
</Wrap>

<style>
</style>
