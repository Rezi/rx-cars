<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import {
		type Observable,
		Subscription,
		delay,
		first,
		finalize,
		debounceTime,
		share,
		distinctUntilChanged
	} from 'rxjs';

	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../framework-components/Description.svelte';
	import { getResetStreamSubscription, prepareForSubscriptions } from '../helpers/stream-control';

	export let width = 0;
	export let height = 0;

	// let autoresetTimer: ReturnType<typeof setTimeout>;

	const customEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[] = [
		{ delay: 500, value: 1, key: 'car' },
		{ delay: 1200, value: 3, key: 'car' },
		{ delay: 1700, value: 3, key: 'car' },
		{ delay: 4100, value: 5, key: 'car' },
		{ delay: 4500, value: 1, key: 'car' },
		{ delay: 7000, value: 1, key: 'car' },
		{ delay: 7500, value: 1, key: 'car' },
		{ delay: 8300, value: 2, key: 'car' }
	];

	const operatorTypeSignatures =
		'distinctUntilChanged<T, K>(comparator?: (previous: K, current: K) => boolean, keySelector: (value: T) => K = identity as (value: T) => K): MonoTypeOperatorFunction<T>';

	const operatorParameters = [
		[
			'comparator',
			'(previous: K, current: K) => boolean',
			`Optional. Default is undefined.
A function used to compare the previous and current keys for equality. Defaults to a === check.`
		],
		[
			'keySelector',
			'(value: T) => K',
			`Optional. Default is identity as (value: T) => K.
Used to select a key value to be passed to the comparator.`
		]
	];

	const codeExamples: string[] = [
		`import { of, distinctUntilChanged } from 'rxjs';

of(1, 1, 1, 2, 2, 2, 1, 1, 3, 3)
  .pipe(distinctUntilChanged())
  .subscribe(console.log);
// Logs: 1, 2, 1, 3`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const debounced = carStream.pipe(
  distinctUntilChanged((prev:Car, curr:Car) => {
    return prev.passengers === curr.passengers;
  })
);`
	];

	const freeText = `Returns a result Observable that emits all values pushed by the source observable if they are distinct in comparison to the last value the result observable emitted.`;
	const exampleText = `In this example, values (cars) are filtered based car's passengers property. First car pass, the next car which will be passed to output stream needs to have different number of passengers then the previous car.`;

	let roadWidth = 100;
	let subscriptions: Subscription;
	let carsOutputStream: Observable<IntervalItems>;
	let carsInputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);

		carsInputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION / 2 }),
			share()
		);

		carsOutputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			delay(ANIMATION_DURATION / 2),
			distinctUntilChanged((prev, curr) => {
				return prev.value === curr.value;
			}),
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION })
		);

		// set the autoreset stream
		subscriptions.add(
			getResetStreamSubscription(
				carsStreamDefinition,
				repeatStore,
				ANIMATION_DURATION * 1.5,
				setStreams
			)
		);
	}

	onDestroy(() => {
		subscriptions?.unsubscribe();
	});

	$: resetStreams($resetStore);

	function resetStreams(resetNumber?: number) {
		resetNumber && setStreams();
	}
</script>

{#key $resetStore}
	<Road x={width / 1.5} y={height * 0.5} width={roadWidth} height={height / 2} isOneLane={true}>
		<Cars
			slot="onroad"
			animationDelay={ANIMATION_DURATION / 2}
			cars={carsInputStream}
			height={height / 2}
			easingFunction={customEasingFn}
			queueCars={false}
			showLastCar={true}
		/>
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="distinctUntilChanged"
				{freeText}
				{exampleText}
				{carCodeExamples}
				{codeExamples}
				{operatorTypeSignatures}
				{operatorParameters}
			/>
		</div>

		<Cars
			slot="onroad"
			animationDelay={ANIMATION_DURATION}
			cars={carsOutputStream}
			{height}
			easingFunction={customEasingFn}
			queueCars={false}
		/>
	</Road>
{/key}

<style>
</style>
