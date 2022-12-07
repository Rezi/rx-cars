<script lang="ts">
	import { onMount } from 'svelte';
	import Road from '../Road.svelte';
	import Roads from '../Roads.svelte';
	import Cars from '../Cars.svelte';
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
	import Description from '../Description.svelte';

	export let width = 0;
	export let height = 0;

	let streamsRemovedCount: number;
	let autoresetTimer: ReturnType<typeof setTimeout>;

	const animationDuration = ANIMATION_DURATION;

	const customeEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[][] = [
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 3000, value: 2, key: 'car' },
			{ delay: 4000, value: 2, key: 'car' },
			{ delay: 6000, value: 2, key: 'car' },
			{ delay: 7500, value: 2, key: 'car' },
			{ delay: 8500, value: 2, key: 'car' }
		],
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 2000, value: 2, key: 'car' },
			{ delay: 3500, value: 2, key: 'car' },
			{ delay: 5000, value: 2, key: 'car' },
			{ delay: 7500, value: 2, key: 'car' }
		],
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 3000, value: 2, key: 'car' },
			{ delay: 5000, value: 2, key: 'car' },
			{ delay: 7000, value: 2, key: 'car' },
			{ delay: 8500, value: 2, key: 'car' },
			{ delay: 9500, value: 2, key: 'car' }
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

	function setupMianRoadStreamDefinition() {
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
				key: 'road'
			};
		});
	}

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);
		mainRoadStreamDefinition = setupMianRoadStreamDefinition();

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
								setStreams();
							}, animationDuration * 2);
						}
					})
				)
				.subscribe()
		);
	}

	$: resetStreams($resetStore);

	function resetStreams(resetNumber?: number) {
		clearTimeout(autoresetTimer);

		resetNumber && setStreams();
	}
</script>

{#key $resetStore}
	{#if mainRroadStream}
		<Road x={width / 2} y={height * 0.1} width={roadWidth} {height} isOneLane={true}>
			<div slot="decription-left">
				<Description
					title="Cars intervals:"
					streamItems={mainRoadStreamDefinition}
					code={`
const clicks = fromEvent(document, 'click');
const intervalEvents = interval(1000);
const buffered = intervalEvents.pipe(buffer(clicks));
buffered.subscribe(x => console.log(x));			
										`}
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

		<Road x={width / 2} y={-height * 0.9} width={roadWidth} {height}>
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
