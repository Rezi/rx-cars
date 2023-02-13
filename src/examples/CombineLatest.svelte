<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import { type Observable, Subscription, share, delay, map, combineLatest } from 'rxjs';
	import {
		getStreamWithIntervals,
		turnToAnimatedStream,
		turnGroupsToAnimatedStream
	} from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../framework-components/Description.svelte';
	import { getResetStreamSubscription } from '../helpers/stream-control';

	export let width = 0;
	export let height = 0;

	const operatorTypeSignatures =
		'combineLatest<O extends ObservableInput<any>, R>(...args: any[]): Observable<R> | Observable<ObservedValueOf<O>[]>';

	const operatorParameters = [['args', 'any[]']];

	const codeExamples: string[] = [
		`import { timer, combineLatest } from 'rxjs';

const firstTimer = timer(0, 1000); // emit 0, 1, 2... after every second, starting from now
const secondTimer = timer(500, 1000); // emit 0, 1, 2... after every second, starting 0,5s from now
const combinedTimers = combineLatest([firstTimer, secondTimer]);
combinedTimers.subscribe(value => console.log(value));
// Logs
// [0, 0] after 0.5s
// [1, 0] after 1s
// [1, 1] after 1.5s
// [2, 1] after 2s`
	];

	const carCodeExamples: string[] = [
		`const carsOutputStream = combineLatest(
  carInputStreams[0], carInputStreams[1]
);`
	];

	const freeText = `Combines multiple Observables to create an Observable whose values are calculated from the latest values of each of its input Observables.`;
	const exampleText = `In this example, values (cars) from two stream are combined together. Once a value (car) in one stream reachs the operator, latest value(car) from the other stream is packed with it and passed to the output Obervable`;

	const animationDuration = ANIMATION_DURATION;

	const customeEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[][] = [
		[
			{ delay: 1000, value: 1, key: 'car' },
			{ delay: 3000, value: 1, key: 'car' },
			{ delay: 6000, value: 1, key: 'car' },
			{ delay: 9000, value: 1, key: 'car' },
			{ delay: 13500, value: 1, key: 'car' },
			{ delay: 16500, value: 1, key: 'car' }
		],
		[
			{ delay: 5000, value: 2, key: 'car' },
			{ delay: 7000, value: 2, key: 'car' },
			{ delay: 8000, value: 2, key: 'car' },
			{ delay: 10000, value: 2, key: 'car' },
			{ delay: 12000, value: 2, key: 'car' },
			{ delay: 13000, value: 2, key: 'car' }
		]
	];

	const animatedStreams: Array<Observable<IntervalItems>> = [];
	const pureInputStreams: Observable<IntervalItem>[] = [];

	let roadWidth = 210;
	let subscriptions: Subscription;
	let carsOutputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setupInputRoadStreamDefinitions() {
		carsStreamDefinition.forEach((group: IntervalItem[], i: number) => {
			pureInputStreams[i] = getStreamWithIntervals(group, i).pipe(share());
			subscriptions?.add(pureInputStreams[i].subscribe());
			animatedStreams[i] = pureInputStreams[i].pipe(turnToAnimatedStream(), share());
		});
	}

	function prepareForSubscriptions() {
		subscriptions?.unsubscribe();
		subscriptions = new Subscription();
	}

	function setStreams() {
		prepareForSubscriptions();

		setupInputRoadStreamDefinitions();

		let tickId = 0;

		//function mapTickId();
		carsOutputStream = combineLatest([pureInputStreams[0], pureInputStreams[1]]).pipe(
			map((data) => {
				tickId++;
				return [
					{ ...data[0], complexId: `${data[0].id}_${tickId}` },
					{ ...data[1], complexId: `${data[1].id}_${tickId}` }
				];
			}),
			delay(animationDuration),
			turnGroupsToAnimatedStream({ removeAfterTime: animationDuration }),
			share()
		);

		// set the autoreset stream
		subscriptions?.add(
			getResetStreamSubscription(
				(carsStreamDefinition.at(0)?.at(-1)?.delay || 0) + animationDuration * 2,
				repeatStore,
				undefined,
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

	function ZipWith(
		arg0: Observable<IntervalItem>
	): import('rxjs').OperatorFunction<IntervalItem, IntervalItem> {
		throw new Error('Function not implemented.');
	}
</script>

{#key $resetStore}
	{#if animatedStreams[0]}
		<Road x={width / 2 + roadWidth / 4} y={height * 0.5} width={roadWidth / 2} {height}>
			<div slot="decription-left">
				<Description
					title="combineLatest:"
					intervalsTitle="Stream intervals:"
					{carCodeExamples}
					{codeExamples}
					{freeText}
					{exampleText}
					width={width / 2}
					{operatorTypeSignatures}
					{operatorParameters}
				/>
			</div>

			<Cars
				slot="onroad"
				queueCars={false}
				animationDelay={animationDuration}
				cars={animatedStreams[0]}
				{height}
				easingFunction={customeEasingFn}
				{carsOutputStream}
			/>
		</Road>

		<Road
			x={width - roadWidth * 0.75}
			y={height * 0.5}
			width={roadWidth / 2}
			{height}
			hasMark={false}
		>
			<Cars
				slot="onroad"
				queueCars={false}
				animationDelay={animationDuration}
				cars={animatedStreams[1]}
				{height}
				easingFunction={customeEasingFn}
				{carsOutputStream}
			/>
		</Road>

		<Road x={(width / 4) * 3 - roadWidth / 4} y={-height * 0.5 - 30} width={roadWidth} {height}>
			<Cars
				slot="onroad"
				animationDelay={animationDuration}
				cars={carsOutputStream}
				{height}
				easingFunction={customeEasingFn}
				queueCars={false}
			/>
		</Road>
	{/if}
{/key}

<style>
</style>
