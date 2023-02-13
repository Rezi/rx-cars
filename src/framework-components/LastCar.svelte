<script lang="ts">
	import Car from './Car.svelte';

	import type { IntervalItems, IntervalItem } from '../models/interval.model';
	import { type Observable, map, delay, filter, distinctUntilChanged } from 'rxjs';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let animationDelay: number;
	export let cars: Observable<IntervalItems>;

	let lastCarStream: Observable<IntervalItem | undefined>;
	let frame: number;
	let elapsed = 0;
	let startTime = 0;

	function update() {
		frame = requestAnimationFrame(update);
		elapsed = Date.now() - startTime;
	}

	function onceCarsReady(cars: Observable<IntervalItems>) {
		if (cars) {
			lastCarStream = cars.pipe(
				filter((cars) => !!cars.items.length),
				map((cars) => {
					return cars.items.at(-1);
				}),
				delay(animationDelay),
				distinctUntilChanged()
			);
		}
	}

	onMount(() => {
		update();
	});

	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(frame);
		}
	});

	$: onceCarsReady(cars);

	$: lastCarSet($lastCarStream);

	function lastCarSet(car: IntervalItem | undefined) {
		if (car) {
			startTime = Date.now();
		}
	}
</script>

{#if $lastCarStream}
	<div class="last-car">
		<Car car={$lastCarStream} carScale={0.9} />
		<span> Last item in input stream </span>
		<strong>
			{(elapsed / 1000).toFixed(1)}s
		</strong>
	</div>
{/if}

<style type="text/scss">
	.last-car {
		padding: 1rem;
		position: absolute;
		left: calc(var(--road-width) + 3.5rem);
		top: 4rem;
		border: 1px dashed black;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
