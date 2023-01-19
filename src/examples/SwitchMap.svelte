<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Roads from '../framework-components/Roads.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import {
		type Observable,
		Subscription,
		switchMap,
		share,
		delay,
		mergeMap,
		first,
		map,
		skip,
		finalize
	} from 'rxjs';
	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { repeatStore } from '../stores/repeat-store';

	import { ANIMATION_DURATION, REMOVE_STREAM_DELAY } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';

	import Description from '../framework-components/Description.svelte';
	import { getResetStreamSubscription } from '../helpers/stream-control';
	export let width = 0;
	export let height = 0;
	const animationDuration = ANIMATION_DURATION;
	let streamsRemovedCount: number;

	const customeEasingFn = (a: number) => a;

	const transformValues = [2, 4, 1];

	const carsStreamDefinition: IntervalItem[][] = [
		[
			{ delay: 1000, value: transformValues[0], key: 'car' },
			{ delay: 3000, value: transformValues[0], key: 'car' },
			{ delay: 6000, value: transformValues[0], key: 'car' },
			{ delay: 9000, value: transformValues[0], key: 'car' },
			{ delay: 11500, value: transformValues[0], key: 'car' },
			{ delay: 13500, value: transformValues[0], key: 'car' }
		],
		[
			{ delay: 5000, value: transformValues[1], key: 'car' },
			{ delay: 7000, value: transformValues[1], key: 'car' },
			{ delay: 8000, value: transformValues[1], key: 'car' },
			{ delay: 10000, value: transformValues[1], key: 'car' },
			{ delay: 12000, value: transformValues[1], key: 'car' },
			{ delay: 17000, value: transformValues[1], key: 'car' }
		],
		[
			{ delay: 10000, value: transformValues[2], key: 'car' },
			{ delay: 11000, value: transformValues[2], key: 'car' },
			{ delay: 12000, value: transformValues[2], key: 'car' },
			{ delay: 13000, value: transformValues[2], key: 'car' },
			{ delay: 15000, value: transformValues[2], key: 'car' },
			{ delay: 19000, value: transformValues[2], key: 'car' }
		]
	];

	const ROADS_INTERVALS = [0, 4000, 9000];

	const animatedSubstreams: Array<Observable<any>> = [];

	const operatorTypeSignatures =
		'switchMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, ObservedValueOf<O> | R>';

	const operatorParameters = [
		[
			'project',
			'(value: T, index: number) => O',
			`A function that, when applied to an item emitted by the source Observable, returns an Observable.`
		],
		[
			'resultSelector',
			'(outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R',
			`Optional. Default is undefined.`
		]
	];

	const codeExamples: string[] = [
		`import { of, switchMap } from 'rxjs';

const switched = of(1, 2, 3).pipe(switchMap(x => of(x, x ** 2, x ** 3)));
switched.subscribe(x => console.log(x));
// outputs
// 1
// 1
// 1
// 2
// 4
// 8
// 3
// 9
// 27`
	];

	const carCodeExamples: string[] = [
		/* `const carStream:Observble<Car> = stream;
const intervalStream:<Observble:TrafficLightsValue>;
const buffered = carStream.pipe(buffer(intervalStream));` */
	];

	const freeText = `Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable.`;
	const exampleText = `In this example, values (streams of cars) are subscribed one by one. The first substream is subscribed and its values (cars) are emited to an output stream. Once the second substream emit a value, first substream is unsubscribed and cars are emited to the output stream only from the second stream. Same repeats once value comes in the third stream, second is unsbscribed...`;

	let roadWidth = 100;
	let subscriptions: Subscription;
	let mainRoadStreamDefinition: IntervalItem[];
	let mainRroadStream: Observable<IntervalItems>;
	let carsOutputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setupMainRoadStreamDefinition() {
		const pureSubstreams: Observable<IntervalItem>[] = [];
		return ROADS_INTERVALS.map((delay: number, i: number): IntervalItem => {
			pureSubstreams[i] = getStreamWithIntervals(carsStreamDefinition[i], i).pipe(share());
			// in order to ensure the subscription is shared among all subcomponents we need to subscribe here in the top level component
			//subscriptions.add(pureSubstreams[i].subscribe());
			animatedSubstreams[i] = pureSubstreams[i].pipe(
				turnToAnimatedStream({ removeAfterTime: animationDuration }),
				share()
			);
			// in order to ensure the subscription is shared among all subcomponents we need to subscribe here in the top level component
			subscriptions.add(animatedSubstreams[i].subscribe());

			return {
				delay,
				animatedSubstream: animatedSubstreams[i],
				pureSubstream: pureSubstreams[i],
				key: 'road',
				value: transformValues[i]
			};
		});
	}

	function prepareForSubscriptions() {
		subscriptions?.unsubscribe();
		subscriptions = new Subscription();
	}

	function setStreams() {
		prepareForSubscriptions();
		mainRoadStreamDefinition = setupMainRoadStreamDefinition();

		const pureMainRoadStream = getStreamWithIntervals(mainRoadStreamDefinition);

		const removeAfterStream: Observable<IntervalItem> = pureMainRoadStream.pipe(
			mergeMap((road: IntervalItem) => {
				return (road.pureSubstream as Observable<IntervalItem>).pipe(
					first(),
					map((car: IntervalItem) => {
						return { delay: road.delay - 1, key: 'remove' };
					}),
					delay(animationDuration + REMOVE_STREAM_DELAY)
				);
			}),
			skip(1)
		);

		streamsRemovedCount = 0;
		subscriptions.add(
			removeAfterStream
				.pipe(
					map(() => {
						streamsRemovedCount++;
						return streamsRemovedCount;
					})
				)
				.subscribe()
		);

		mainRroadStream = pureMainRoadStream.pipe(
			// turnToAnimatedStream(animationDuration),
			turnToAnimatedStream({ removeAfterStream }),
			share()
		);

		carsOutputStream = pureMainRoadStream.pipe(
			switchMap((road: IntervalItem) => {
				return road.pureSubstream as Observable<IntervalItem>;
			}),
			delay(animationDuration),
			turnToAnimatedStream({ removeAfterTime: animationDuration }),

			share()
		);

		// set the autoreset stream
		subscriptions.add(
			getResetStreamSubscription(
				(carsStreamDefinition.at(-1)?.at(-1)?.delay || 0) + animationDuration * 2,
				repeatStore,
				undefined,
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
	{#if mainRroadStream}
		<Road x={width / 2 + roadWidth} y={height * 0.1} width={roadWidth} {height} isOneLane={true}>
			<div slot="decription-left">
				<Description
					title="switchMap:"
					streamItems={mainRoadStreamDefinition}
					intervalsTitle="Stream intervals:"
					{freeText}
					{exampleText}
					width={width / 2 - roadWidth / 2}
					{codeExamples}
					{carCodeExamples}
					{operatorTypeSignatures}
					{operatorParameters}
				/>
			</div>
			<svelte:fragment slot="onroad">
				<Roads
					{roadWidth}
					{height}
					{animationDuration}
					roadsStream={mainRroadStream}
					let:cars
					let:roadId
				>
					{#if cars && roadId}
						<Cars
							queueCars={false}
							animationDelay={animationDuration}
							{cars}
							{height}
							easingFunction={customeEasingFn}
						/>
					{/if}
				</Roads>
			</svelte:fragment>
		</Road>

		<Road x={width / 2 + roadWidth} y={-height * 0.9} width={roadWidth} {height} isOneLane={true}>
			<Cars
				slot="onroad"
				animationDelay={animationDuration}
				cars={carsOutputStream}
				{height}
				easingFunction={customeEasingFn}
				queueCars={false}
				moveStartPerStreamIndex={roadWidth * 2.2}
				{streamsRemovedCount}
			/>
		</Road>
	{/if}
{/key}

<style>
</style>
