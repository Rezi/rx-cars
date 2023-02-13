<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import { type Observable, Subscription, delay, skip, filter, share } from 'rxjs';

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
		{ delay: 1000, value: 3, key: 'car' },
		{ delay: 1700, value: 2, key: 'car' },
		{ delay: 2100, value: 1, key: 'car' },
		{ delay: 2700, value: 1, key: 'car' },
		{ delay: 3100, value: 5, key: 'car' },
		{ delay: 3500, value: 1, key: 'car' },
		{ delay: 4000, value: 3, key: 'car' },
		{ delay: 5000, value: 1, key: 'car' },
		{ delay: 5500, value: 1, key: 'car' },
		{ delay: 6500, value: 2, key: 'car' }
	];

	const operatorTypeSignatures = 'skip<T>(count: number): MonoTypeOperatorFunction<T>';

	const operatorParameters = [
		[
			'count',
			'number',
			'The number of times, items emitted by source Observable should be skipped.'
		]
	];

	const codeExamples: string[] = [
		`import { interval, skip } from 'rxjs';

// emit every half second
const source = interval(500);
// skip the first 10 emitted values
const result = source.pipe(skip(10));

result.subscribe(value => console.log(value));
// output: 10...11...12...13...`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const filtered = carStream.pipe(
  skip(3)
);`
	];

	const freeText = `Returns an Observable that skips the first count items emitted by the source Observable.`;
	const exampleText = `In this example, first 3 values (cars) are skipped in the output Observable`;

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
			skip(3),
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION }),
			share()
		);

		// set the autoreset stream
		subscriptions.add(
			getResetStreamSubscription(
				carsStreamDefinition,
				repeatStore,
				ANIMATION_DURATION * 1.5,
				resetStore
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
		/>
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="skip"
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
