<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import LastCar from '../framework-components/LastCar.svelte';

	import {
		type Observable,
		Subscription,
		share,
		delay,
		last,
		of,
		mergeWith,
		take,
		first
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

	const closeDelay = 1000;

	const customEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[] = [
		{ delay: 500, value: 1, key: 'car' },
		{ delay: 1000, value: 3, key: 'car' },
		{ delay: 1700, value: 2, key: 'car' },
		{ delay: 2100, value: 1, key: 'car' },
		{ delay: 2700, value: 1, key: 'car' },
		{ delay: 3100, value: 5, key: 'car' }
	];

	const operatorTypeSignatures =
		'last<T, D>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>';

	const operatorParameters = [
		[
			'predicate',
			'(value: T, index: number, source: Observable<T>) => boolean',
			`Optional. Default is undefined.
The condition any source emitted item has to satisfy.`
		],
		[
			'defaultValue',
			'D',
			`Optional. Default is undefined.
An optional default value to provide if last predicate isn't met or no values were emitted.`
		]
	];

	const codeExamples: string[] = [
		`import { from, last } from 'rxjs';

const source = from(['x', 'y', 'z']);
const result = source.pipe(last());

result.subscribe(value => console.log(\`Last alphabet: \${ value }\`));

// Outputs
// Last alphabet: z`,
		`import { from, last } from 'rxjs';

const source = from(['x', 'y', 'z']);
const result = source.pipe(last(char => char === 'a', 'not found'));

result.subscribe(value => console.log(\`'a' is \${ value }.\`));

// Outputs
// 'a' is not found.`
	];

	const carCodeExamples: string[] = [
		`const cars:Observable<Car> = carsSource;
const onlyLast = cars.pipe(
  take(${carsStreamDefinition.length})
  last(),
  delay(${closeDelay})
);`
	];

	const freeText = `Returns an Observable that emits only the last item emitted by the source Observable. It optionally takes a predicate function as a parameter, in which case, rather than emitting the last item from the source Observable, the resulting Observable will emit the last item from the source Observable that satisfies the predicate.`;
	const exampleText = `In this example, only last value (car) is passed to the output Obervable, but only after the stream is closed, 1000 ms after the last car.`;

	let roadWidth = 100;
	let subscriptions: Subscription;
	let closeStream: Observable<boolean>;
	let carsOutputStream: Observable<IntervalItems>;
	let carsInputStream: Observable<IntervalItems>;

	onMount(() => {
		setStreams();
	});

	function setStreams() {
		subscriptions = prepareForSubscriptions(subscriptions);

		carsInputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			turnToAnimatedStream({
				removeAfterTime: ANIMATION_DURATION / 2
			}),
			share()
		);

		carsOutputStream = getStreamWithIntervals(carsStreamDefinition).pipe(
			delay(ANIMATION_DURATION / 2),
			take(carsStreamDefinition.length),
			last(),
			turnToAnimatedStream({
				removeAfterTime: ANIMATION_DURATION
			}),
			first(),
			delay(closeDelay),
			share()
		);

		closeStream = of(false).pipe(
			mergeWith(
				of(true).pipe(
					delay((carsStreamDefinition.at(-1)?.delay || 0) + ANIMATION_DURATION / 2 + closeDelay)
				)
			)
		);

		// set the autoreset stream
		subscriptions.add(
			getResetStreamSubscription(
				carsStreamDefinition,
				repeatStore,
				ANIMATION_DURATION * 1.5,
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
	<Road
		{closeStream}
		x={width / 1.5}
		y={height * 0.5}
		width={roadWidth}
		height={height / 2}
		isOneLane={true}
	>
		<Cars
			slot="onroad"
			animationDelay={ANIMATION_DURATION / 2}
			cars={carsInputStream}
			height={height / 2}
			easingFunction={customEasingFn}
			queueCars={false}
		/>
		<LastCar slot="side-panel" animationDelay={ANIMATION_DURATION / 2} cars={carsInputStream} />
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="last"
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
