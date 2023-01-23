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
	let carItems: Observable<(IntervalItem | CarGroup)[]>;

	interface CarGroup {
		id?: string;
		cars: IntervalItem[];
		complexId?: string;
		streamIndex?: number;
		isGroup: true;
	}

	function update() {
		frame = requestAnimationFrame(update);
		elapsed = Date.now() - startTime;
	}

	function setupCars() {
		//if (queueCars) console.log('setup');
		carItems = cars.pipe(
			map((cars) => {
				//if (queueCars) console.log(cars);
				return cars.items;
			}),
			scan(
				(acc, cur) => {
					const toReturn = {
						items: cur,
						prevCarIds: cur
							.filter((item) => !('isGroup' in item))
							.map((item) => item.complexId || item.id),
						groups: [...acc.groups]
					};

					const newItems = cur.filter(
						(item) => !('isGroup' in item) && !acc.prevCarIds.includes(item.complexId || item.id)
					);

					if (newItems.length > 1) {
						const group = newItems.map((item) => {
							return item.complexId || item.id;
						});

						toReturn.groups.push(group);
					}

					return toReturn;
				},
				{ items: [], prevCarIds: [], groups: [] } as {
					items: IntervalItem[];
					prevCarIds: (string | undefined)[];
					groups: (string | undefined)[][];
				}
			),
			map((data): (IntervalItem | CarGroup)[] => {
				const reducedItems = data.items.reduce(
					(acc, cur) => {
						const carId = (cur.complexId || cur.id) as string;
						const parantGroup = data.groups.find((groupOfIds) => {
							return groupOfIds.includes(carId);
						});
						if (parantGroup) {
							const parantGroupString = parantGroup.join(':');
							acc.groups[parantGroupString] = acc.groups[parantGroupString] || [];
							acc.groups[parantGroupString].push(cur);
						} else {
							acc.singles.push(cur);
						}

						return acc;
					},
					{ singles: [], groups: {} } as {
						singles: IntervalItem[];
						groups: Record<string, IntervalItem[]>;
					}
				);

				const groupedItems = [
					...reducedItems.singles,
					...Object.entries(reducedItems.groups).map((data: [string, IntervalItem[]]): CarGroup => {
						const [complexId, items] = data;
						return {
							id: items[0].id,
							cars: items,
							complexId,
							streamIndex: items[0].streamIndex,
							isGroup: true
						};
					})
				];

				//if (queueCars) console.log(groupedItems);

				return groupedItems;
			})
		);
	}

	function onCarsReady(cars: Observable<IntervalItems>) {
		if (cars) {
			!carItems && setupCars();
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

	onMount(() => {
		update();
	});

	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(frame);
		}
	});

	$: onCarsReady(cars);

	$: lastCarSet($lastCarStream);

	function lastCarSet(car: IntervalItem | undefined) {
		if (car) {
			startTime = Date.now();
		}
	}
</script>

{#if $cars && carItems && $carItems}
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
	{#each $carItems as carItem, index (carItem.complexId || carItem.id)}
		<div
			class="car-wrap"
			class:absolute={!queueCars}
			in:fly={{
				delay: 0,
				duration: animationDelay,
				x: 0,
				y: height + ((carItem.streamIndex || 0) - streamsRemovedCount) * moveStartPerStreamIndex,
				opacity: 1,
				easing: easingFunction
			}}
		>
			{#if 'isGroup' in carItem}
				<div class="cars-group">
					{#each carItem.cars as car}
						<Car {car} {carParts} />
					{/each}
				</div>
			{:else}
				<Car car={carItem} {carParts} />
			{/if}
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
	}

	.car-wrap {
		display: inline-block;
	}

	.cars-group {
		display: flex;
		flex-wrap: wrap;
	}

	.absolute {
		position: absolute;
	}
</style>
