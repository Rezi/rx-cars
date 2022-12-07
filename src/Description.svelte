<script lang="ts">
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import type { IntervalItem } from './models/interval.model';
	import { ANIMATION_DURATION } from './consts/consts';

	export let code: string = '';
	export let title: string = '';
	export let streamItems: IntervalItem[] = [];
</script>

<h3>{title}</h3>
<ul>
	{#each streamItems as car}
		<li>{(car.delay + ANIMATION_DURATION) / 1000}</li>
	{/each}
</ul>
<Highlight language={typescript} {code} />

<style type="text/scss">
	:global(code.hljs) {
		background-color: transparent;
		font-size: 1.2rem;
		position: relative;
		z-index: 3;
		line-height: 1.4;
	}

	h3 {
		padding-top: 1rem;
	}

	ul {
		list-style: none;
		display: flex;
		li {
			font-weight: bold;
			padding-right: 1.5rem;
		}
	}
</style>
