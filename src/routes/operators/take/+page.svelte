<script>
	import Take from '../../../examples/Take.svelte';
	import Wrap from '../../../examples/Wrap.svelte';
</script>

<Wrap let:width let:height>
	<Take {width} {height} />
</Wrap>

<style>
</style>
