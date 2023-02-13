<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import LastCar from '../framework-components/LastCar.svelte';

	import {
		type Observable,
		Subscription,
		withLatestFrom,
		share,
		delay,
		map,
		Subject,
		BehaviorSubject
	} from 'rxjs';
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
		'withLatestFrom<T, R>(...inputs: any[]): OperatorFunction<T, R | any[]>';

	const operatorParameters = [['inputs', 'any[]']];

	const codeExamples: string[] = [
		`import { fromEvent, interval, withLatestFrom } from 'rxjs';

const clicks = fromEvent(document, 'click');
const timer = interval(1000);
const result = clicks.pipe(withLatestFrom(timer));
result.subscribe(x => console.log(x));`
	];

	const carCodeExamples: string[] = [
		`const carsOutputStream = carInputStreams[0].pipe(
  withLatestFrom(carInputStreams[1])
);`
	];

	const freeText = `Combines the source Observable with other Observables to create an Observable whose values are calculated from the latest values of each, only when the source emits.`;
	const exampleText = `In this example, values (cars) in the main stream are combined with another stream. Once car in main stream pass the operator and there is a value from the other stream which has already passed the operator, values (cars) from both streams are passed together to the output Obervable`;

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

	let roadWidth = 190;
	let subscriptions: Subscription;
	let carsOutputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setupInputRoadStreamDefinitions() {
		carsStreamDefinition.forEach((group: IntervalItem[], i: number) => {
			pureInputStreams[i] = getStreamWithIntervals(group, i).pipe(share());
			subscriptions?.add(pureInputStreams[i].subscribe());
			animatedStreams[i] = pureInputStreams[i].pipe(
				turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION }),
				share()
			);

			subscriptions.add(animatedStreams[i].subscribe());
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

		carsOutputStream = pureInputStreams[0].pipe(
			withLatestFrom(pureInputStreams[1]),
			map((data) => {
				tickId++;
				return [
					{ ...data[0], complexId: `${data[0].id}_${tickId}` },
					{ ...data[1], complexId: `${data[1].id}_${tickId}` }
				];
			}),
			delay(animationDuration),
			turnGroupsToAnimatedStream(),
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
</script>

{#key $resetStore}
	{#if animatedStreams[0]}
		<Road
			x={width / 2 + roadWidth / 2}
			y={height * 0.5}
			width={roadWidth}
			{height}
			markRotation={-45}
		>
			<div slot="decription-left">
				<Description
					title="withLatestFrom:"
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
			/>
		</Road>

		<Road
			x={width * 0.75 + roadWidth / 2}
			y={height * 0.5}
			width={roadWidth}
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
			/>
			<LastCar slot="side-panel" animationDelay={animationDuration} cars={animatedStreams[1]} />
		</Road>

		<Road x={width / 2 + roadWidth / 2} y={-height * 0.5} width={roadWidth} {height}>
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
