<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import {
		type Observable,
		Subscription,
		delay,
		first,
		finalize,
		share,
		distinctUntilKeyChanged
	} from 'rxjs';

	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../framework-components/Description.svelte';
	import { getResetStreamSubscription, prepareForSubscriptions } from '../helpers/stream-control';

	export let width = 0;
	export let height = 0;

	// let autoresetTimer: ReturnType<typeof setTimeout>;

	const customEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[] = [
		{ delay: 500, value: 1, key: 'car' },
		{ delay: 1200, value: 3, key: 'car' },
		{ delay: 1700, value: 3, key: 'car' },
		{ delay: 4100, value: 5, key: 'car' },
		{ delay: 4500, value: 1, key: 'car' },
		{ delay: 7000, value: 1, key: 'car' },
		{ delay: 7500, value: 1, key: 'car' },
		{ delay: 8300, value: 2, key: 'car' }
	];

	const operatorTypeSignatures =
		'distinctUntilKeyChanged<T, K extends keyof T>(key: K, compare?: (x: T[K], y: T[K]) => boolean): MonoTypeOperatorFunction<T>';

	const operatorParameters = [
		['key', 'K', `String key for object property lookup on each item.`],
		[
			'compare',
			'(x: T[K], y: T[K]) => boolean',
			`Optional. Default is undefined.
Optional comparison function called to test if an item is distinct from the previous item in the source.`
		]
	];

	const codeExamples: string[] = [
		`import { of, distinctUntilKeyChanged } from 'rxjs';
 
 of(
   { age: 4, name: 'Foo' },
   { age: 7, name: 'Bar' },
   { age: 5, name: 'Foo' },
   { age: 6, name: 'Foo' }
 ).pipe(
   distinctUntilKeyChanged('name')
 )
 .subscribe(x => console.log(x));
  
 // displays:
 // { age: 4, name: 'Foo' }
 // { age: 7, name: 'Bar' }
 // { age: 5, name: 'Foo' }`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const debounced = carStream.pipe(
  distinctUntilKeyChanged('passengers')
);`
	];

	const freeText = `Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item, using a property accessed by using the key provided to check if the two items are distinct.`;
	const exampleText = `In this example, values (cars) are filtered based car's passengers property. First car pass, the next car which will be passed to output stream needs to have different number of passengers then the previous car.`;

	let roadWidth = 100;
	let subscriptions: Subscription;
	let carsOutputStream: Observable<IntervalItems>;
	let carsInputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);

		carsInputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION / 2 }),
			share()
		);

		carsOutputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			delay(ANIMATION_DURATION / 2),
			distinctUntilKeyChanged('value'),
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION }),
			share()
		);

		// set the autoreset stream
		subscriptions.add(
			getResetStreamSubscription(
				carsStreamDefinition,
				repeatStore,
				ANIMATION_DURATION * 1.5,
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
	<Road x={width / 1.5} y={height * 0.5} width={roadWidth} height={height / 2} isOneLane={true}>
		<Cars
			slot="onroad"
			animationDelay={ANIMATION_DURATION / 2}
			cars={carsInputStream}
			height={height / 2}
			easingFunction={customEasingFn}
			queueCars={false}
			showLastCar={true}
		/>
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="distinctUntilKeyChanged"
				{freeText}
				{exampleText}
				{carCodeExamples}
				{codeExamples}
				{operatorTypeSignatures}
				{operatorParameters}
			/>
		</div>

		<Cars
			slot="onroad"
			animationDelay={ANIMATION_DURATION}
			cars={carsOutputStream}
			{height}
			easingFunction={customEasingFn}
			queueCars={false}
		/>
	</Road>
{/key}

<style>
</style>
