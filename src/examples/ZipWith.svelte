<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import {
		type Observable,
		Subscription,
		zipWith,
		share,
		delay,
		map,
		Subject,
		BehaviorSubject
	} from 'rxjs';
	import {
		getStreamWithIntervals,
		turnToAnimatedStream,
		turnGroupsToAnimatedStream,
		getPassedCarsIds
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
		'zipWith<T, A extends readonly unknown[]>(...otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>';

	const operatorParameters = [
		[
			'otherInputs',
			'[...ObservableInputTuple<A>]',
			'other observable inputs to collate values from.'
		]
	];

	const codeExamples: string[] = [
		`import { fromEvent, zipWith, map } from "rxjs";

const documentEvent = (eventName) =>
  fromEvent(document, eventName).pipe(
    map((e: MouseEvent) => ({ x: e.clientX, y: e.clientY }))
  );

documentEvent("mousedown")
  .pipe(zipWith(documentEvent("mouseup")))
  .subscribe((e) => console.log(JSON.stringify(e)));
`
	];

	const carCodeExamples: string[] = [
		`const carsOutputStream = carInputStreams[0].pipe(
  zipWith(carInputStreams[1])
);`
	];

	const freeText = `Subscribes to the source, and the observable inputs provided as arguments, and combines their values, by index, into arrays.`;
	const exampleText = `In this example, values (cars) in the main stream are combined with another stream. Once cars with same index (same color) in both streams reach the operator. They are together passed to the output stream`;

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

	function setupInputRoadStreamDefinitions(removeById: Subject<string[]>) {
		carsStreamDefinition.forEach((group: IntervalItem[], i: number) => {
			pureInputStreams[i] = getStreamWithIntervals(group, i).pipe(share());
			subscriptions?.add(pureInputStreams[i].subscribe());
			animatedStreams[i] = pureInputStreams[i].pipe(
				turnToAnimatedStream({ removeByIds: removeById }),
				share()
			);
		});
	}

	function prepareForSubscriptions() {
		subscriptions?.unsubscribe();
		subscriptions = new Subscription();
	}

	function setStreams() {
		prepareForSubscriptions();

		const removeCarsByIdSubject = new BehaviorSubject<string[]>([]);
		setupInputRoadStreamDefinitions(removeCarsByIdSubject);

		carsOutputStream = pureInputStreams[0].pipe(
			zipWith(pureInputStreams[1]),
			delay(animationDuration),
			turnGroupsToAnimatedStream({ removeAfterTime: animationDuration / 2 }),
			share()
		);

		subscriptions?.add(
			getPassedCarsIds(carsOutputStream).subscribe((carIds) => {
				removeCarsByIdSubject.next(carIds);
			})
		);

		// set the autoreset stream
		subscriptions?.add(
			getResetStreamSubscription(
				(carsStreamDefinition.at(0)?.at(-1)?.delay || 0) + animationDuration * 2,
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

	function ZipWith(
		arg0: Observable<IntervalItem>
	): import('rxjs').OperatorFunction<IntervalItem, IntervalItem> {
		throw new Error('Function not implemented.');
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
					title="zipWith:"
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
				showPassedCars={true}
				queueCars={true}
				animationDelay={animationDuration}
				cars={animatedStreams[0]}
				{height}
				easingFunction={customeEasingFn}
				{carsOutputStream}
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
				showPassedCars={true}
				queueCars={true}
				animationDelay={animationDuration}
				cars={animatedStreams[1]}
				{height}
				easingFunction={customeEasingFn}
				{carsOutputStream}
			/>
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
