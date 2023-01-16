<script>
	import Last from '../../../examples/Last.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Last {width} {height} />
</Wrap>

<style>
</style>
