<script lang="ts">
	import { onMount } from 'svelte';
	import Road from '../Road.svelte';
	import Roads from '../Roads.svelte';
	import Cars from '../Cars.svelte';
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

	import Description from '../Description.svelte';
	export let width = 0;
	export let height = 0;
	const animationDuration = ANIMATION_DURATION;
	let streamsRemovedCount: number;

	const customeEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[][] = [
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 3000, value: 2, key: 'car' },
			{ delay: 6000, value: 2, key: 'car' },
			{ delay: 9000, value: 2, key: 'car' },
			{ delay: 11500, value: 2, key: 'car' },
			{ delay: 13500, value: 2, key: 'car' }
		],
		[
			{ delay: 5000, value: 1, key: 'car' },
			{ delay: 7000, value: 2, key: 'car' },
			{ delay: 8000, value: 2, key: 'car' },
			{ delay: 10000, value: 2, key: 'car' },
			{ delay: 12000, value: 2, key: 'car' },
			{ delay: 17000, value: 2, key: 'car' }
		],
		[
			{ delay: 10000, value: 1, key: 'car' },
			{ delay: 11000, value: 2, key: 'car' },
			{ delay: 12000, value: 2, key: 'car' },
			{ delay: 13000, value: 2, key: 'car' },
			{ delay: 15000, value: 2, key: 'car' },
			{ delay: 19000, value: 2, key: 'car' }
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

	function setupMianRoadStreamDefinition() {
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
				key: 'road'
			};
		});
	}

	function prepareForSubscriptions() {
		subscriptions?.unsubscribe();
		subscriptions = new Subscription();
	}

	function setStreams() {
		prepareForSubscriptions();
		mainRoadStreamDefinition = setupMianRoadStreamDefinition();

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
		const lastCarDelay = (carsStreamDefinition.at(-1)?.at(-1)?.delay || 0) + animationDuration * 2;

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

	$: resetStreams($resetStore);

	function resetStreams(resetNumber?: number) {
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
