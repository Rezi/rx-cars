<script>
	import CombineLatest from '../../../examples/CombineLatest.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<CombineLatest {width} {height} />
</Wrap>

<style>
</style>
