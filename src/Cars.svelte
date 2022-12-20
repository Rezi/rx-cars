<script lang="ts">
	import Car from './Car.svelte';
	import { cubicOut } from 'svelte/easing';

	import { fly } from 'svelte/transition';
	import type { IntervalItems } from './models/interval.model';
	import type { Observable } from 'rxjs';
	import type { CarParts } from './models/parts.model';

	export let animationDelay: number;
	export let height: number;
	export let cars: Observable<IntervalItems>;
	export let easingFunction: (arg: number) => number = cubicOut;
	export let queueCars = true;
	export let moveStartPerStreamIndex = 0;
	export let streamsRemovedCount: number = 0;
	export let carParts: CarParts = 'all';
</script>

{#if $cars}
	{#each $cars.items as car (car.id)}
		<div
			class="car-wrap"
			class:absolute={!queueCars}
			in:fly={{
				delay: 0,
				duration: animationDelay,
				x: 0,
				y: height + ((car.streamIndex || 0) - streamsRemovedCount) * moveStartPerStreamIndex,
				opacity: 1,
				easing: easingFunction
			}}
		>
			<Car {car} {carParts} />
		</div>
	{/each}
{/if}

<slot />

<style type="text/scss">
	.car-wrap {
		width: min-content;
		display: inline-block;
	}

	.absolute {
		position: absolute;
	}
</style>
