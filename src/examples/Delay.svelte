<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import { type Observable, Subscription, share, delay, first, finalize } from 'rxjs';

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
		{ delay: 1000, value: 1, key: 'car' },
		{ delay: 3000, value: 2, key: 'car' },
		{ delay: 6000, value: 3, key: 'car' },
		{ delay: 9000, value: 4, key: 'car' },
		{ delay: 11500, value: 5, key: 'car' },
		{ delay: 13500, value: 6, key: 'car' }
	];

	const inputStreemAnimationDuration = ANIMATION_DURATION / 2;
	const streamDelay = ANIMATION_DURATION / 2;

	const operatorTypeSignatures =
		'delay<T>(due: number | Date, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T>';

	const operatorParameters = [
		[
			'due',
			'number | Date	',
			`The delay duration in milliseconds (a number) or a Date until which the emission of the source items is delayed.`
		],
		[
			'scheduler',
			'SchedulerLike',
			`Optional. Default is asyncScheduler.
The SchedulerLike to use for managing the timers that handle the time-shift for each item.`
		]
	];

	const codeExamples: string[] = [
		`import { fromEvent, delay } from 'rxjs';

const clicks = fromEvent(document, 'click');
const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
delayedClicks.subscribe(x => console.log(x));`
	];

	const carCodeExamples: string[] = [
		`const cars:Observable<Car> = carsSource;
const delayedCars = cars.pipe(delay(${streamDelay}));`
	];

	const freeText = `Delays the emission of items from the source Observable by a given timeout or until a given Date.`;
	const exampleText = `In this example, values emited in the stream are delayed by ${streamDelay} ms.`;

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
			turnToAnimatedStream({ removeAfterTime: inputStreemAnimationDuration + streamDelay }),
			share()
		);

		carsOutputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			delay(inputStreemAnimationDuration + streamDelay),
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION }),
			share()
		);

		// set the autoreset stream
		subscriptions.add(
			getResetStreamSubscription(
				carsStreamDefinition,
				repeatStore,
				ANIMATION_DURATION * 2,
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
			animationDelay={inputStreemAnimationDuration}
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
				title="delay"
				{freeText}
				{exampleText}
				{codeExamples}
				{carCodeExamples}
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
