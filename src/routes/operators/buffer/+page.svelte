<script>
	import Buffer from '../../../examples/Buffer.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Buffer {width} {height} />
</Wrap>

<style>
</style>
