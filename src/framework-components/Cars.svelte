<script lang="ts">
	import Car from './Car.svelte';
	import { cubicOut } from 'svelte/easing';

	import { fly } from 'svelte/transition';
	import type { IntervalItems, IntervalItem } from '../models/interval.model';
	import { type Observable, map, delay, filter, distinctUntilChanged, scan } from 'rxjs';
	import type { CarParts } from '../models/parts.model';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getPassedCarsIds } from '../helpers/stream-factory';
	import { flip } from 'svelte/animate';

	export let animationDelay: number;
	export let height: number;
	export let cars: Observable<IntervalItems>;
	export let carsOutputStream: Observable<IntervalItems> | undefined = undefined;
	export let easingFunction: (arg: number) => number = cubicOut;
	export let queueCars = true;
	export let moveStartPerStreamIndex = 0;
	export let streamsRemovedCount: number = 0;
	export let carParts: CarParts = 'all';
	export let showLastCar = false;
	export let showPassedCars = false;

	let lastCarStream: Observable<IntervalItem | undefined>;
	let passedCars: Observable<IntervalItem[]>;
	let carIdsInOutputStream: Observable<string[]>;

	let frame: number;
	let elapsed = 0;
	let startTime = 0;

	function update() {
		frame = requestAnimationFrame(update);
		elapsed = Date.now() - startTime;
	}

	onMount(() => {
		update();
	});

	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(frame);
		}
	});

	$: {
		if (cars) {
			if (showLastCar) {
				lastCarStream = cars.pipe(
					filter((cars) => !!cars.items.length),
					map((cars) => {
						return cars.items.at(-1);
					}),
					delay(animationDelay),
					distinctUntilChanged()
				);
			}

			if (showPassedCars) {
				passedCars = cars.pipe(
					scan((accu, cur) => {
						const merged: IntervalItem[] = [...accu, ...cur.items];
						const arrayUniqueByKey = [...new Map(merged.map((item) => [item.id, item])).values()];
						return arrayUniqueByKey;
					}, [] as IntervalItem[]),
					delay(animationDelay)
				);

				if (carsOutputStream) {
					carIdsInOutputStream = getPassedCarsIds(carsOutputStream);
				}
			}
		}
	}

	$: lastCarSet($lastCarStream);

	function lastCarSet(car: IntervalItem | undefined) {
		if (car) {
			startTime = Date.now();
		}
	}
</script>

{#if $cars}
	{#if showPassedCars && $passedCars}
		<div class="passed-cars">
			<div class="title">Cars reached / passed the operator</div>
			{#each $passedCars as car (car.id)}
				<div class:used-car={car.id && $carIdsInOutputStream?.includes(car.id)}>
					<Car carScale={0.9} {car} />
				</div>
			{/each}
		</div>
	{/if}
	{#each $cars.items as car, index (car.id)}
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

{#if showLastCar && $lastCarStream}
	<div class="last-car">
		<Car car={$lastCarStream} />
		<span> Last item in input stream </span>
		<strong>
			{(elapsed / 1000).toFixed(1)}s
		</strong>
	</div>
{/if}

<slot />

<style type="text/scss">
	.passed-cars {
		padding: 0.5rem;
		position: absolute;
		left: calc(var(--road-width) + 3.5rem);
		top: 4rem;
		border: 1px dashed black;
		display: flex;
		flex-direction: column;

		.used-car {
			opacity: 0.3;
		}

		.title {
			position: absolute;
			left: 0;
			transform: translateX(-100%);
			writing-mode: vertical-lr;
			white-space: nowrap;
		}
	}
	.last-car {
		padding: 1rem;
		position: absolute;
		left: calc(var(--road-width) + 3.5rem);
		top: 4rem;
		border: 1px dashed black;
		display: flex;
		flex-direction: column;
		align-items: center;
		//border-radius: 1rem;
	}

	.car-wrap {
		width: min-content;
		display: inline-block;
	}

	.absolute {
		position: absolute;
	}
</style>
