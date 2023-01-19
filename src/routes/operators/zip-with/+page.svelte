<script>
	import ZipWith from '../../../examples/ZipWith.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<ZipWith {width} {height} />
</Wrap>

<style>
</style>
