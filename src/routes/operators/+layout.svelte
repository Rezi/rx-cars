<script lang="ts">
	import { resetStore } from '../../stores/reset-store';
	import { repeatStore } from '../../stores/repeat-store';

	import github from 'svelte-highlight/styles/github';
</script>

<svelte:head>
	{@html github}
</svelte:head>

<div class="window">
	<div class="control-wrap">
		<button
			on:click={() => {
				$resetStore++;
			}}>Restart</button
		>

		<label class="pl-1">Repeat<input type="checkbox" bind:checked={$repeatStore} id="" /></label>
	</div>
	<slot />
</div>

<style type="text/scss">
	.window {
		font-family: Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif;
		position: relative;
		overflow: hidden;
		height: 100vh;
		width: 100vw;
		display: flex;
	}

	.pl-1 {
		padding-left: 1rem;
	}

	.control-wrap {
		position: absolute;
		bottom: 1.5rem;
		left: 2rem;
		z-index: 2;
		display: flex;
		align-items: center;

		input[type='checkbox'] {
			margin-bottom: 0;
		}
	}
</style>
