<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import TrafficLights from '../framework-components/TrafficLights.svelte';
	import { share, buffer, mergeWith, delay, map, take, finalize, Subscription } from 'rxjs';
	import type { Observable } from 'rxjs';
	import { quadIn } from 'svelte/easing';
	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION, GREEN_LIGHT_DURATION } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import { prepareForSubscriptions } from '../helpers/stream-control';

	import Description from '../framework-components/Description.svelte';
	export let width = 0;
	export let height = 0;
	let roadWidth = 320;
	let autoresetTimer: ReturnType<typeof setTimeout>;
	const animationDuration = ANIMATION_DURATION;

	const operatorTypeSignatures =
		'buffer<T>(closingNotifier: ObservableInput<any>): OperatorFunction<T, T[]>';

	const operatorParameters = [
		[
			'closingNotifier',
			'ObservableInput<any>',
			`An ObservableInput that signals the buffer to be emitted on the output Observable.
`
		]
	];

	let codeExamples = [
		`
const clicks = fromEvent(document, 'click');
const intervalEvents = interval(1000);
const buffered = intervalEvents.pipe(buffer(clicks));
buffered.subscribe(x => console.log(x));			
										`
	];

	let carCodeExamples = [
		`const cars:Observable<Car> = carsSource;
const intervals:Observble<TrafficLightsValue> = trafficLightsSource;
const buffered = cars.pipe(buffer(intervals));`
	];

	const freeText = `Buffers the source Observable values until closingNotifier emits.`;
	const exampleText = `In this example, values (cars) are buffered by intervals of the traffic lights stream. Compare intervals of boths stream in order to understand how the buffered batches are created`;

	let subscriptions: Subscription;

	let carStreamDefinition: IntervalItem[] = [
		{ delay: 0, value: 2, key: 'car' },
		{ delay: 1000, value: 1, key: 'car' },
		{ delay: 3000, value: 2, key: 'car' },
		{ delay: 6000, value: 3, key: 'car' },
		{ delay: 7500, value: 2, key: 'car' },
		{ delay: 11000, value: 4, key: 'car' },
		{ delay: 12000, value: 4, key: 'car' },
		{ delay: 15000, value: 2, key: 'car' },
		{ delay: 16000, value: 3, key: 'car' },
		{ delay: 17000, value: 1, key: 'car' },
		{ delay: 18000, value: 1, key: 'car' }
	];

	let lightsStreamDefinition: IntervalItem[] = [
		{ delay: 3500, key: 'light' },
		{ delay: 8000, key: 'light' },
		{ delay: 13000, key: 'light' },
		{ delay: 18000, key: 'light' }
	];

	let controlStream: Observable<IntervalItems>;
	let carsStream: Observable<IntervalItems>;
	let carsOutputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);
		const trafficLightStream = getStreamWithIntervals(lightsStreamDefinition).pipe(share());

		controlStream = trafficLightStream.pipe(turnToAnimatedStream(), share());

		carsStream = getStreamWithIntervals(carStreamDefinition).pipe(
			mergeWith(trafficLightStream.pipe(delay(animationDuration - GREEN_LIGHT_DURATION))),
			turnToAnimatedStream({ removeOnKey: 'light' }),
			share()
		);

		// set the autoreset stream
		subscriptions.add(
			getStreamWithIntervals(carStreamDefinition)
				.pipe(
					take(carStreamDefinition.length),
					delay(animationDuration),
					finalize(() => {
						if ($repeatStore) {
							autoresetTimer = setTimeout(() => {
								$resetStore++;
							}, animationDuration);
						}
					})
				)
				.subscribe()
		);

		carsOutputStream = getStreamWithIntervals(carStreamDefinition).pipe(
			buffer(trafficLightStream),
			delay(animationDuration - GREEN_LIGHT_DURATION),
			map((cars: IntervalItem[]) => {
				return { items: cars };
			}),
			share()
		);

		subscriptions.add(carsStream.subscribe());
		subscriptions.add(controlStream.subscribe());
		subscriptions.add(carsOutputStream.subscribe());
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
	{#if controlStream && carsStream}
		<Road x={width / 2} y={height / 2} width={roadWidth} height={height / 2}>
			<div slot="decription-left">
				<Description
					title="buffer"
					intervalsTitle="Cars intervals:"
					{freeText}
					{exampleText}
					streamItems={carStreamDefinition}
					width={width / 2 - roadWidth / 2}
					{codeExamples}
					{carCodeExamples}
					{operatorTypeSignatures}
					{operatorParameters}
				/>
			</div>
			<Cars slot="onroad" cars={carsStream} height={height / 2} animationDelay={animationDuration}>
				<TrafficLights
					{animationDuration}
					{controlStream}
					x={roadWidth + 30}
					y={50}
					width={width / 2}
				>
					<div style="width:{width / 2 - roadWidth / 2 - 100}px">
						<Description
							width={width / 2 - roadWidth / 2}
							intervalsTitle="Traffic lights intervals:"
							streamItems={lightsStreamDefinition}
						/>
					</div>
				</TrafficLights>
			</Cars>
		</Road>

		<Road x={width / 2} y={-height / 2} width={roadWidth} {height}>
			<Cars
				slot="onroad"
				cars={carsOutputStream}
				animationDelay={animationDuration}
				{height}
				easingFunction={quadIn}
			/>
		</Road>
	{/if}
{/key}

<style>
</style>
