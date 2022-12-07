<script lang="ts">
	let width: number;
	let height: number;
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<slot {width} {height} />
