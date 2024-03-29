<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Roads from '../framework-components/Roads.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import {
		type Observable,
		Subscription,
		share,
		delay,
		concatMap,
		take,
		from,
		mergeMap,
		of,
		skip
	} from 'rxjs';
	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { repeatStore } from '../stores/repeat-store';
	import { ANIMATION_DURATION, REMOVE_STREAM_DELAY } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { map, finalize } from 'rxjs';
	import { prepareForSubscriptions } from '../helpers/stream-control';
	import Description from '../framework-components/Description.svelte';

	export let width = 0;
	export let height = 0;

	const operatorTypeSignatures =
		'concatMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, ObservedValueOf<O> | R>';

	const operatorParameters = [
		[
			'project',
			'(value: T, index: number) => O	',
			`A function that, when applied to an item emitted by the source Observable, returns an Observable.`
		],
		[
			'resultSelector',
			'(outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R',
			'Optional. Default is undefined.'
		]
	];

	const codeExamples: string[] = [
		`content_copyopen_in_new
import { fromEvent, concatMap, interval, take } from 'rxjs';
 
const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  concatMap(ev => interval(1000).pipe(take(4)))
);
result.subscribe(x => console.log(x));
 
// Results in the following:
// (results are not concurrent)
// For every click on the "document" it will emit values 0 to 3 spaced
// on a 1000ms interval
// one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3`
	];

	const carCodeExamples: string[] = [
		`const cars:Observble<number> = carsSource;
cars.pipe(concatMap((n: number) => {
  return getStreamOfCarsWithNPassengers(n);
}))`
	];

	const freeText = `Projects each source value to an Observable which is merged in the output Observable, in a serialized fashion waiting for each one to complete before merging the next.`;
	const exampleText = `In this example, numbers are emited in the main stream. Once the number is processed by the operator function, it is turned to a substream of cars with passengers count equal to value from main stream. 
	After that the substream is flatened and values (cars) eleveted from it to the output Obervable.
	Once the substream is closed next number from the main stream is processed in the same way.`;

	let streamsRemovedCount: number;
	let autoresetTimer: ReturnType<typeof setTimeout>;

	const animationDuration = ANIMATION_DURATION;

	const customeEasingFn = (a: number) => a;

	const transformValues = [2, 4, 1];
	const carsStreamDefinition: IntervalItem[][] = [
		[
			{ delay: 1000, value: transformValues[0], key: 'car' },
			{ delay: 3000, value: transformValues[0], key: 'car' },
			{ delay: 4000, value: transformValues[0], key: 'car' },
			{ delay: 6000, value: transformValues[0], key: 'car' },
			{ delay: 7500, value: transformValues[0], key: 'car' },
			{ delay: 8500, value: transformValues[0], key: 'car' }
		],
		[
			{ delay: 1000, value: transformValues[1], key: 'car' },
			{ delay: 2000, value: transformValues[1], key: 'car' },
			{ delay: 3500, value: transformValues[1], key: 'car' },
			{ delay: 5000, value: transformValues[1], key: 'car' },
			{ delay: 7500, value: transformValues[1], key: 'car' }
		],
		[
			{ delay: 1000, value: transformValues[2], key: 'car' },
			{ delay: 3000, value: transformValues[2], key: 'car' },
			{ delay: 5000, value: transformValues[2], key: 'car' },
			{ delay: 7000, value: transformValues[2], key: 'car' },
			{ delay: 8500, value: transformValues[2], key: 'car' },
			{ delay: 9500, value: transformValues[2], key: 'car' }
		]
	];

	const ROADS_INTERVALS = [0, 4000, 9000];

	const animatedSubstreams: Array<Observable<any>> = [];

	let roadWidth = 100;
	let subscriptions: Subscription;
	let mainRoadStreamDefinition: IntervalItem[];
	let mainRroadStream: Observable<IntervalItems>;
	let carsOutputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function getSubstreamsDelays(): number[] {
		const concatDelays = carsStreamDefinition.map((set: IntervalItem[]) => {
			return (set?.at(-1) as IntervalItem).delay || 0;
		});

		return [0, ...concatDelays].reduce(
			(acc, cur) => {
				acc.list.push(acc.accu + cur);
				acc.accu += cur;
				return acc;
			},
			{ accu: 0, list: [] as number[] }
		).list;
	}

	function setupMainRoadStreamDefinition() {
		const pureSubstreams: Observable<IntervalItem>[] = [];

		return ROADS_INTERVALS.map((delayNumber: number, i: number): IntervalItem => {
			pureSubstreams[i] = getStreamWithIntervals(carsStreamDefinition[i], i).pipe(
				take(carsStreamDefinition[i].length),
				share()
			);

			const accumulatedDelays = getSubstreamsDelays();

			animatedSubstreams[i] = getStreamWithIntervals(carsStreamDefinition[i], i).pipe(
				delay(accumulatedDelays[i]),
				take(carsStreamDefinition[i].length),
				turnToAnimatedStream({ removeAfterTime: animationDuration }),
				share()
			);
			// in order to ensure the subscription is shared among all subcomponents we need to subscribe here in the top level component
			subscriptions.add(animatedSubstreams[i].subscribe());

			return {
				delay: delayNumber,
				animatedSubstream: animatedSubstreams[i],
				pureSubstream: pureSubstreams[i],
				key: 'road',
				value: transformValues[i]
			};
		});
	}

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);
		mainRoadStreamDefinition = setupMainRoadStreamDefinition();

		const pureMainRoadStream = getStreamWithIntervals(mainRoadStreamDefinition);

		const accumulatedDelays = getSubstreamsDelays();

		const removeAfterStream: Observable<IntervalItem> = from(accumulatedDelays).pipe(
			mergeMap((delayTime: number, i: number) => {
				return of({
					delay: ROADS_INTERVALS[i] - 1,
					key: 'remove',
					id: 'remove' + i
				}).pipe(delay(delayTime + animationDuration + REMOVE_STREAM_DELAY));
			}),
			skip(1),
			take(ROADS_INTERVALS.length - 1)
		);

		mainRroadStream = pureMainRoadStream.pipe(turnToAnimatedStream({ removeAfterStream }), share());

		carsOutputStream = pureMainRoadStream.pipe(
			concatMap((road: IntervalItem) => {
				return road.pureSubstream as Observable<IntervalItem>;
			}),
			delay(animationDuration),
			turnToAnimatedStream({ removeAfterTime: animationDuration }),

			share()
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

		// set the autoreset stream
		subscriptions.add(
			from(accumulatedDelays)
				.pipe(
					mergeMap((delayTime: number, i: number) => {
						return of(null).pipe(delay(delayTime));
					}),
					skip(1),
					take(ROADS_INTERVALS.length),
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
	{#if mainRroadStream}
		<Road x={width / 2 + roadWidth} y={height * 0.1} width={roadWidth} {height} isOneLane={true}>
			<div slot="decription-left">
				<Description
					title="concatMap:"
					intervalsTitle="Stream intervals:"
					streamItems={mainRoadStreamDefinition}
					{carCodeExamples}
					{codeExamples}
					{freeText}
					{exampleText}
					width={width / 2 - roadWidth / 2}
					{operatorTypeSignatures}
					{operatorParameters}
				/>
			</div>
			<div slot="onroad">
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
			</div>
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
