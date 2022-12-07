<script lang="ts">
	import Green from './Green.svelte';
	import { fly } from 'svelte/transition';
	import type { IntervalItem } from './models/interval.model';
	import type { Observable } from 'rxjs';

	export let x = 0;
	export let y = 0;
	export let width = 0;
	let GreenLightwidth = 300;

	export let controlStream: Observable<{ items: IntervalItem[] }>;
	export let animationDuration: number;
</script>

<div
	class="trafic-lights-wrap"
	style="left:{x}px; top:{y}px; --trafic-light-green-width:{GreenLightwidth}px"
>
	<div class="lights-stream">
		{#if $controlStream}
			{#each $controlStream.items as green (green.id)}
				<div
					class="green-light"
					in:fly={{
						delay: 0,
						duration: animationDuration,
						x: width + GreenLightwidth,
						y: 0,
						opacity: 1,
						easing: (t) => t
					}}
				>
					<Green />
				</div>
			{/each}
		{/if}
	</div>
	<div class="trafic-lights">
		<div class="red" />
		<div class="green" />
		<div class="trafic-lights-stands" />
	</div>
	<div class="description">
		<slot />
	</div>
</div>

<style type="text/scss">
	:root {
		--trafic-light-color: #333;
		--trafic-light-width: 2rem;
		--trafic-light-head-height: 3.5rem;
	}

	.description {
		position: relative;
		top: 7rem;
	}

	.trafic-lights-wrap {
		position: absolute;
	}

	.lights-stream {
		position: absolute;
		top: 0rem;
		left: 0;
		display: flex;
		height: var(--trafic-light-head-height);
		width: 1000px;
		overflow: hidden;

		&:after {
			content: '';
			width: 100%;
			height: 50%;
			background: #f00;
		}
	}

	.green-light {
		position: absolute;
		top: 0;
		left: 0;
		transform: translateX(calc(var(--trafic-light-green-width) * -1));
		width: var(--trafic-light-green-width);
		height: var(--trafic-light-head-height);
		background-color: rgb(0, 203, 0);
		border-top: calc(var(--trafic-light-head-height) / 2) solid #fff;
	}

	.trafic-lights {
		height: 3.5rem;
		width: var(--trafic-light-width);
		background-color: var(--trafic-light-color);
		display: flex;
		justify-content: center;
		mix-blend-mode: darken;
		position: absolute;

		.red,
		.green {
			position: absolute;
			top: 0.5rem;
			left: 50%;
			transform: translateX(-50%);
			background-color: #fff;
			width: 1rem;
			height: 1rem;
			border-radius: 50%;

			&:after {
				content: '';
				display: block;
				width: 1.5rem;
				height: 1.5rem;
				background-color: #000;
				filter: blur(0.92em);
				mix-blend-mode: hue;
				transform: translate(-0.25rem, -0.25rem);
			}
		}

		.green {
			top: 2rem;
		}
	}

	.trafic-lights-stands {
		top: 100%;
		width: 0.5rem;
		height: 3rem;
		background-color: var(--trafic-light-color);
		position: absolute;

		&:after {
			content: '';
			display: block;
			width: var(--trafic-light-width);
			height: 0.5rem;
			background-color: var(--trafic-light-color);
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>
