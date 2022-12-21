<script lang="ts">
	import { onMount } from 'svelte';
	import Road from '../Road.svelte';
	import Roads from '../Roads.svelte';
	import Cars from '../Cars.svelte';
	import { type Observable, Subscription, mergeMap, share, delay, first, finalize, of } from 'rxjs';
	import { quadIn } from 'svelte/easing';
	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../Description.svelte';

	export let width = 0;
	export let height = 0;

	// let autoresetTimer: ReturnType<typeof setTimeout>;

	const codeExamples: string[] = [
		`import { of, mergeMap, interval, map } from 'rxjs';
 
 const letters = of('a', 'b', 'c');
 const result = letters.pipe(
   mergeMap(x => interval(1000).pipe(map(i => x + i)))
 );
  
 result.subscribe(x => console.log(x));
  
 // Results in the following:
 // a0
 // b0
 // c0
 // a1
 // b1
 // c1
 // continues to list a, b, c every second with respective ascending integers`
	];
	const carCodeExamples: string[] = [];

	const freeText = `Projects each source value to an Observable which is merged in the output Observable.
	
In this example, values (streams of cars) are subscribed all together and their values (cars) are emited to an output stream.`;

	const animationDuration = ANIMATION_DURATION;

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
		mainRoadStreamDefinition = ROADS_INTERVALS.map((delay: number, i: number): IntervalItem => {
			pureSubstreams[i] = getStreamWithIntervals(carsStreamDefinition[i], i).pipe(share());
			pureSubstreams[i].subscribe();
			animatedSubstreams[i] = pureSubstreams[i].pipe(
				turnToAnimatedStream({ removeAfterTime: animationDuration }),
				share()
			);

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
		setupMianRoadStreamDefinition();
		// in order to ensure the subscription is shared among all subcomponents we need to subscribe here in the top level component
		carsStreamDefinition.forEach((substreamDefinition, i) => {
			subscriptions.add(animatedSubstreams[i].subscribe());
		});

		const pureMainRoadStream = getStreamWithIntervals(mainRoadStreamDefinition);

		mainRroadStream = pureMainRoadStream.pipe(turnToAnimatedStream(), share());

		carsOutputStream = pureMainRoadStream.pipe(
			mergeMap((road: IntervalItem) => {
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
					title="MergeMap:"
					intervalsTitle="Stream intervals:"
					streamItems={mainRoadStreamDefinition}
					{carCodeExamples}
					{codeExamples}
					{freeText}
					width={width / 2 - roadWidth / 2}
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
			/>
		</Road>
	{/if}
{/key}

<style>
</style>
