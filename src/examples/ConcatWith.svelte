<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import {
		type Observable,
		Subscription,
		share,
		delay,
		take,
		of,
		concatWith,
		mergeWith,
		from,
		mergeMap,
		skip
	} from 'rxjs';
	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { repeatStore } from '../stores/repeat-store';
	import { ANIMATION_DURATION, REMOVE_STREAM_DELAY } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { finalize } from 'rxjs';
	import { prepareForSubscriptions } from '../helpers/stream-control';
	import Description from '../framework-components/Description.svelte';

	export let width = 0;
	export let height = 0;

	const operatorTypeSignatures =
		'concatWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>';

	const operatorParameters = [
		[
			'otherSources',
			'[...ObservableInputTuple<A>]',
			'Other observable sources to subscribe to, in sequence, after the original source is complete.'
		]
	];

	const codeExamples: string[] = [
		`import { fromEvent, map, take, concatWith } from 'rxjs';

const clicks$ = fromEvent(document, 'click');
const moves$ = fromEvent(document, 'mousemove');

clicks$.pipe(
  map(() => 'click'),
  take(1),
  concatWith(
    moves$.pipe(
      map(() => 'move')
    )
  )
)
.subscribe(x => console.log(x));

// 'click'
// 'move'
// 'move'
// 'move'
// ...`
	];

	const carCodeExamples: string[] = [];

	const freeText = `Emits all of the values from the source observable, then, once it completes, subscribes to each observable source provided, one at a time, emitting all of their values, and not subscribing to the next one until it completes.`;
	const exampleText = `In this example, values (streams of cars) are subscribed one by one. The first substream is subscribed and its values (cars) are emited to an output Obervable. Once the first substream is closed, second substream is subscribed and cars from it are emited to the output Obervable and so on`;

	let autoresetTimer: ReturnType<typeof setTimeout>;

	const animationDuration = ANIMATION_DURATION;

	const customeEasingFn = (a: number) => a;

	const carsStreamDefinitions: IntervalItem[][] = [
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 3000, value: 2, key: 'car' },
			{ delay: 4100, value: 2, key: 'car' },
			{ delay: 6100, value: 2, key: 'car' },
			{ delay: 7500, value: 2, key: 'car' },
			{ delay: 8500, value: 2, key: 'car' }
		],
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 2100, value: 2, key: 'car' },
			{ delay: 3500, value: 2, key: 'car' },
			{ delay: 5200, value: 2, key: 'car' },
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

	const animatedStreams: Array<Observable<any>> = [];
	const pureStreams: Observable<IntervalItem>[] = [];
	const closeStreams: Observable<boolean>[] = [];

	let roadWidth = 100;
	let subscriptions: Subscription;
	let carsOutputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function getSubstreamsDelays(): number[] {
		const concatDelays = carsStreamDefinitions.map((set: IntervalItem[]) => {
			return (set?.at(-1) as IntervalItem).delay || 0;
		});

		const allDelays = [0, ...concatDelays].reduce(
			(acc, cur) => {
				acc.list.push(acc.accu + cur);
				acc.accu += cur;
				return acc;
			},
			{ accu: 0, list: [] as number[] }
		).list;

		return allDelays;
	}

	function setupStreamsDefinition() {
		const accumulatedDelays = getSubstreamsDelays().slice(0, -1);

		return accumulatedDelays.forEach((delayNumber: number, i: number) => {
			pureStreams[i] = getStreamWithIntervals(carsStreamDefinitions[i], i).pipe(
				take(carsStreamDefinitions[i].length),
				share()
			);

			animatedStreams[i] = getStreamWithIntervals(carsStreamDefinitions[i], i).pipe(
				delay(accumulatedDelays[i]),
				take(carsStreamDefinitions[i].length),
				turnToAnimatedStream({ removeAfterTime: animationDuration }),
				share()
			);

			closeStreams[i] = of(false).pipe(
				mergeWith(of(true).pipe(delay(ANIMATION_DURATION + getSubstreamsDelays().slice(1)[i])))
			);
			// in order to ensure the subscription is shared among all subcomponents we need to subscribe here in the top level component
			subscriptions.add(animatedStreams[i].subscribe());
		});
	}

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);
		setupStreamsDefinition();

		const accumulatedDelays = getSubstreamsDelays();

		carsOutputStream = pureStreams[0].pipe(
			concatWith(pureStreams[1], pureStreams[2]),
			delay(animationDuration),
			turnToAnimatedStream({ removeAfterTime: animationDuration }),
			share()
		);

		// set the autoreset stream
		subscriptions.add(
			of(<number>accumulatedDelays.at(-1))
				.pipe(
					mergeMap((delayTime: number) => {
						return of(null).pipe(delay(delayTime));
					}),
					take(1),
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
	{#each animatedStreams as stream, index}
		<Road
			x={width / 2}
			y={height * 0.1}
			width={roadWidth}
			{height}
			isOneLane={true}
			rotation={index * -20}
			hasMark={index === 0}
			marginTop="0"
			closeStream={closeStreams[index]}
			zIndex={closeStreams.length - index}
		>
			<div slot="decription-left">
				{#if closeStreams.length - 1 === index}
					<Description
						title="concatWith:"
						intervalsTitle="Stream intervals:"
						{carCodeExamples}
						{codeExamples}
						{freeText}
						{exampleText}
						width={width / 2 - roadWidth / 2}
						{operatorTypeSignatures}
						{operatorParameters}
					/>
				{/if}
			</div>
			<Cars
				slot="onroad"
				queueCars={false}
				animationDelay={animationDuration}
				cars={animatedStreams[index]}
				{height}
				easingFunction={customeEasingFn}
			/>
		</Road>
	{/each}
	<Road x={width / 2} y={-height * 0.9} width={roadWidth} {height} zIndex={9} isOneLane={true}>
		<Cars
			slot="onroad"
			animationDelay={animationDuration}
			cars={carsOutputStream}
			{height}
			easingFunction={customeEasingFn}
			queueCars={false}
		/>
	</Road>
{/key}

<style>
</style>
