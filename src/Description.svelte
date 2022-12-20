<script lang="ts">
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import type { IntervalItem } from './models/interval.model';
	import { ANIMATION_DURATION } from './consts/consts';

	export let carCodeExamples: string[] = [];
	export let codeExamples: string[] = [];
	export let title: string = '';
	export let intervalsTitle: string = '';
	export let freeText: string = '';
	export let width: number = 0;
	export let streamItems: IntervalItem[] = [];
</script>

<div style="width:{width}px" class="description-block">
	<h1>{title}</h1>
	<p class="free-text">{freeText}</p>
	{#if streamItems?.length}
		<h3>{intervalsTitle}</h3>
		<ul>
			{#each streamItems as car}
				<li>{(car.delay + ANIMATION_DURATION) / 1000}</li>
			{/each}
		</ul>
	{/if}

	{#if carCodeExamples?.length}
		<h3>Code example of animation</h3>
		{#each carCodeExamples as code}
			<Highlight language={typescript} {code} />
		{/each}
	{/if}
	{#if codeExamples?.length}
		<h3>Other code examples</h3>
		{#each codeExamples as code}
			<Highlight language={typescript} {code} />
		{/each}
	{/if}
</div>

<style type="text/scss">
	:global(code.hljs) {
		background-color: transparent;
		font-size: 1.2rem;
		position: relative;
		z-index: 3;
		line-height: 1.4;
	}

	.description-block {
		padding-right: 4rem;
	}

	.free-text {
		white-space: pre-wrap;
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
