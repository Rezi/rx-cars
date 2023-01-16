<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import { type Observable, Subscription, delay, first, finalize, debounceTime, share } from 'rxjs';

	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../framework-components/Description.svelte';
	import { prepareForSubscriptions } from '../helpers/stream-control';

	export let width = 0;
	export let height = 0;

	// let autoresetTimer: ReturnType<typeof setTimeout>;

	const customEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[] = [
		{ delay: 500, value: 1, key: 'car' },
		{ delay: 1200, value: 3, key: 'car' },
		{ delay: 1700, value: 2, key: 'car' },
		{ delay: 4100, value: 5, key: 'car' },
		{ delay: 4500, value: 1, key: 'car' },
		{ delay: 7000, value: 1, key: 'car' },
		{ delay: 7500, value: 1, key: 'car' },
		{ delay: 8300, value: 2, key: 'car' }
	];

	const operatorTypeSignatures =
		'debounceTime<T>(dueTime: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T>';

	const operatorParameters = [
		[
			'dueTime',
			'number',
			`The timeout duration in milliseconds (or the time unit determined internally by the optional scheduler) for the window of time required to wait for emission silence before emitting the most recent source value.`
		],
		[
			'scheduler',
			'SchedulerLike',
			`Optional. Default is asyncScheduler.
The SchedulerLike to use for managing the timers that handle the timeout for each value.`
		]
	];

	const codeExamples: string[] = [
		`import { fromEvent, debounceTime } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(debounceTime(1000));
result.subscribe(x => console.log(x));`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const debounced = carStream.pipe(
  debounceTime(1000)
);`
	];

	const freeText = `Emits a notification from the source Observable only after a particular time span has passed without another source emission.`;
	const exampleText = `In this example, values (cars) waits for given time (1000ms). 
Only if this time elapses and no other value is comming in the source stream within the timeframe, the value is emited to the output stream`;

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
			debounceTime(1000),
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION })
		);

		// set the autoreset stream
		const lastCarDelay = (carsStreamDefinition.at(-1)?.delay || 0) + ANIMATION_DURATION * 1.5;

		subscriptions.add(
			getStreamWithIntervals([{ delay: lastCarDelay, key: 'reset' }])
				.pipe(
					first(),
					finalize(() => {
						if ($repeatStore) {
							setStreams();
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
				title="debounceTime"
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
