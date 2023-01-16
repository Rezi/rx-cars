<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import {
		type Observable,
		Subscription,
		share,
		delay,
		of,
		mergeWith,
		take,
		takeUntil
	} from 'rxjs';

	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../framework-components/Description.svelte';
	import { getResetStreamSubscription, prepareForSubscriptions } from '../helpers/stream-control';
	import TrafficLights from '../framework-components/TrafficLights.svelte';

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
		{ delay: 4000, value: 3, key: 'car' },
		{ delay: 5000, value: 1, key: 'car' },
		{ delay: 6000, value: 1, key: 'car' }
	];

	const takeUntilTime = 3500;

	let lightsStreamDefinition: IntervalItem[] = [
		{ delay: takeUntilTime, key: 'light' },
		{ delay: takeUntilTime + 300, key: 'light' },
		{ delay: takeUntilTime + 600, key: 'light' },
		{ delay: takeUntilTime + 900, key: 'light' },
		{ delay: takeUntilTime + 1200, key: 'light' }
	];

	const operatorTypeSignatures =
		'takeUntil<T>(notifier: ObservableInput<any>): MonoTypeOperatorFunction<T>';

	const operatorParameters = [
		[
			'notifier',
			'ObservableInput<any>',
			'The Observable whose first emitted value will cause the output Observable of takeUntil to stop emitting values from the source Observable.'
		]
	];

	const codeExamples: string[] = [
		`import { interval, fromEvent, takeUntil } from 'rxjs';

const source = interval(1000);
const clicks = fromEvent(document, 'click');
const result = source.pipe(takeUntil(clicks));
result.subscribe(x => console.log(x));`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const filtered = carStream.pipe(
  takeUntil(trafficLightsStream)
);`
	];

	const freeText = `Emits the values emitted by the source Observable until a notifier Observable emits a value.`;
	const exampleText = `In this example, only values (cars) are passed to the output stream, before the trafficLightsStream emits its first value (6.5sec). After that the output stream is closed`;

	let roadWidth = 100;
	let subscriptions: Subscription;
	let closeStream: Observable<boolean>;
	let controlStream: Observable<IntervalItems>;
	let carsOutputStream: Observable<IntervalItems>;
	let carsInputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);

		const trafficLightStream = getStreamWithIntervals(lightsStreamDefinition);

		controlStream = trafficLightStream.pipe(turnToAnimatedStream(), share());

		carsInputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			turnToAnimatedStream({
				removeAfterTime: ANIMATION_DURATION / 2
			}),
			share()
		);

		carsOutputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			takeUntil(trafficLightStream),
			delay(ANIMATION_DURATION / 2),
			turnToAnimatedStream({
				removeAfterTime: ANIMATION_DURATION
			}),
			share()
		);

		closeStream = of(false).pipe(
			mergeWith(of(true).pipe(delay(takeUntilTime + ANIMATION_DURATION / 2)))
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
	<Road
		{closeStream}
		x={width / 1.5}
		y={height * 0.5}
		width={roadWidth}
		height={height / 2}
		isOneLane={true}
	>
		<Cars
			slot="onroad"
			animationDelay={ANIMATION_DURATION / 2}
			cars={carsInputStream}
			height={height / 2}
			easingFunction={customEasingFn}
			queueCars={false}
		>
			<TrafficLights
				reversed={true}
				animationDuration={2000}
				{controlStream}
				x={roadWidth + 30}
				y={50}
				width={width / 2}
				greenLightwidth={width / 4}
			>
				<div style="width:{width / 2 - roadWidth / 2 - 100}px">
					<Description
						width={width / 2 - roadWidth / 2}
						intervalsTitle="Traffic lights intervals:"
						streamItems={lightsStreamDefinition}
					/>
				</div>
			</TrafficLights></Cars
		>
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="TakeUntil"
				intervalsTitle="Stream intervals:"
				streamItems={carsStreamDefinition}
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
