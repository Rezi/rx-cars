<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import LastCar from '../framework-components/LastCar.svelte';
	import {
		type Observable,
		Subscription,
		share,
		delay,
		take,
		of,
		forkJoin,
		mergeWith,
		mergeMap,
		map
	} from 'rxjs';
	import {
		getStreamWithIntervals,
		turnToAnimatedStream,
		turnGroupsToAnimatedStream
	} from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { repeatStore } from '../stores/repeat-store';
	import { ANIMATION_DURATION, REMOVE_STREAM_DELAY } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { finalize } from 'rxjs';
	import { prepareForSubscriptions } from '../helpers/stream-control';
	import Description from '../framework-components/Description.svelte';

	export let width = 0;
	export let height = 0;

	const operatorTypeSignatures = 'forkJoin(...args: any[]): Observable<any>';

	const operatorParameters = [
		[
			'args',
			'any[]',
			'Any number of Observables provided either as an array or as an arguments passed directly to the operator.'
		]
	];

	const codeExamples: string[] = [
		`import { forkJoin, of, timer } from 'rxjs';

const observable = forkJoin({
  foo: of(1, 2, 3, 4),
  bar: Promise.resolve(8),
  baz: timer(4000)
});
observable.subscribe({
 next: value => console.log(value),
 complete: () => console.log('This is how it ends!'),
});

// Logs:
// { foo: 4, bar: 8, baz: 0 } after 4 seconds
// 'This is how it ends!' immediately after`
	];

	const carCodeExamples: string[] = [
		`const carsOutputStream = forkJoin([
  carInputStreams[0].pipe(take(3)), 
  carInputStreams[1].pipe(take(4)), 
  carInputStreams[2].pipe(take(5))
]);`
	];

	const freeText = `Accepts an Array of ObservableInput or a dictionary Object of ObservableInput and returns an Observable that emits either an array of values in the exact same order as the passed array, or a dictionary of values in the same shape as the passed dictionary.`;
	const exampleText = `In this example, once all input streams are closed, the output emits array with latest car from each closed input stream`;

	let autoresetTimer: ReturnType<typeof setTimeout>;

	const animationDuration = ANIMATION_DURATION;

	const customeEasingFn = (a: number) => a;

	const carsStreamDefinitions: IntervalItem[][] = [
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 3000, value: 2, key: 'car' },
			{ delay: 4100, value: 2, key: 'car' }
		],
		[
			{ delay: 500, value: 1, key: 'car' },
			{ delay: 2100, value: 2, key: 'car' },
			{ delay: 3500, value: 2, key: 'car' },
			{ delay: 5200, value: 2, key: 'car' }
		],
		[
			{ delay: 100, value: 1, key: 'car' },
			{ delay: 2000, value: 2, key: 'car' },
			{ delay: 5000, value: 2, key: 'car' },
			{ delay: 7000, value: 2, key: 'car' },
			{ delay: 8500, value: 2, key: 'car' }
		]
	];

	const latestDelay = Math.max(
		...carsStreamDefinitions.map((inputStreamDerfinition: IntervalItem[]) => {
			return inputStreamDerfinition.at(-1)?.delay || 0;
		})
	);

	const animatedStreams: Array<Observable<any>> = [];
	const pureStreams: Observable<IntervalItem>[] = [];
	const closeStreams: Observable<boolean>[] = [];

	let roadWidth = 100;
	let subscriptions: Subscription;
	let carsOutputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	/* function getSubstreamsDelays(): number[] {
		const concatDelays = carsStreamDefinitions.map((set: IntervalItem[]) => {
			return (set?.at(-1) as IntervalItem).delay || 0;
		});

		const allDelays = [0, ...concatDelays].reduce(
			(acc, cur) => {
				acc.list.push(acc.accu + cur);
				acc.accu += cur;
				return acc;
			},
			{ accu: 0, list: [] as number[] }
		).list;

		return allDelays;
	} */

	function setupStreamsDefinition() {
		//const accumulatedDelays = getSubstreamsDelays().slice(0, -1);

		return carsStreamDefinitions.forEach((inputStreamDerfinition: IntervalItem[], i: number) => {
			pureStreams[i] = getStreamWithIntervals(inputStreamDerfinition, i).pipe(
				take(carsStreamDefinitions[i].length),
				share()
			);

			animatedStreams[i] = getStreamWithIntervals(inputStreamDerfinition, i).pipe(
				take(carsStreamDefinitions[i].length),
				turnToAnimatedStream({ removeAfterTime: animationDuration }),
				share()
			);

			const latestDelayInStream = inputStreamDerfinition.at(-1)?.delay || 0;
			closeStreams[i] = of(false).pipe(
				mergeWith(of(true).pipe(delay(ANIMATION_DURATION + latestDelayInStream)))
			);
			// in order to ensure the subscription is shared among all subcomponents we need to subscribe here in the top level component
			subscriptions.add(animatedStreams[i].subscribe());
		});
	}

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);
		setupStreamsDefinition();

		carsOutputStream = forkJoin(pureStreams).pipe(
			map((data) => data),
			delay(animationDuration),
			turnGroupsToAnimatedStream(),
			share()
		);

		subscriptions.add(carsOutputStream.subscribe());

		// set the autoreset stream
		subscriptions.add(
			of(latestDelay)
				.pipe(
					mergeMap((delayTime: number) => {
						return of(null).pipe(delay(delayTime));
					}),
					take(1),
					finalize(() => {
						if ($repeatStore) {
							autoresetTimer = setTimeout(() => {
								$resetStore++;
							}, animationDuration * 2);
						}
					})
				)
				.subscribe()
		);
	}

	onDestroy(() => {
		subscriptions?.unsubscribe();
	});

	$: resetStreams($resetStore);

	function resetStreams(resetNumber?: number) {
		clearTimeout(autoresetTimer);

		resetNumber && setStreams();
	}
</script>

{#key $resetStore}
	{#each animatedStreams as stream, index}
		<Road
			x={width / 2 + (index * width) / 5.5}
			y={height * 0.5}
			width={roadWidth}
			{height}
			isOneLane={true}
			hasMark={index === 0}
			marginTop="0"
			markRotation={-45}
			closeStream={closeStreams[index]}
		>
			<div slot="decription-left">
				{#if index === 0}
					<Description
						title="forkJoin:"
						{carCodeExamples}
						{codeExamples}
						{freeText}
						{exampleText}
						width={width / 2 - roadWidth / 2}
						{operatorTypeSignatures}
						{operatorParameters}
					/>
				{/if}
			</div>
			<Cars
				slot="onroad"
				animationDelay={animationDuration}
				cars={animatedStreams[index]}
				{height}
				easingFunction={customeEasingFn}
				queueCars={false}
			/>

			<LastCar slot="side-panel" animationDelay={animationDuration} cars={animatedStreams[index]} />
		</Road>
	{/each}
	<Road x={width / 2} y={-height * 0.5} width={roadWidth} {height} isOneLane={true}>
		<Cars
			slot="onroad"
			animationDelay={animationDuration}
			cars={carsOutputStream}
			{height}
			easingFunction={customeEasingFn}
			queueCars={false}
		/>
	</Road>
{/key}

<style>
</style>
