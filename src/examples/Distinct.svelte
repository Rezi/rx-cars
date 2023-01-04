<script lang="ts">
	import { onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import { type Observable, Subscription, delay, share, distinct } from 'rxjs';

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
		'distinct<T, K>(keySelector?: (value: T) => K, flushes?: ObservableInput<any>): MonoTypeOperatorFunction<T>';

	const operatorParameters = [
		[
			'keySelector',
			'(value: T) => K',
			`Optional. Default is undefined.
						Optional function to select which value you want to check as distinct.`
		],
		[
			`flushes`,
			`ObservableInput<any>`,
			`Optional. Default is undefined.
Optional ObservableInput for flushing the internal HashSet of the operator.`
		]
	];

	const codeExamples: string[] = [
		`import { of, distinct } from 'rxjs';

of(1, 1, 2, 2, 2, 1, 2, 3, 4, 3, 2, 1)
  .pipe(distinct())
  .subscribe(x => console.log(x));

// Outputs
// 1
// 2
// 3
// 4`,
		`import { of, distinct } from 'rxjs';

of(
  { age: 4, name: 'Foo'},
  { age: 7, name: 'Bar'},
  { age: 5, name: 'Foo'}
)
.pipe(distinct(({ name }) => name))
.subscribe(x => console.log(x));

// Outputs
// { age: 4, name: 'Foo' }
// { age: 7, name: 'Bar' }`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const debounced = carStream.pipe(
  distinct(({ passengers }) => passengers),
);`
	];

	const freeText = `Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
	
In this example, values (cars) are filtered based car's passengers property. Only cars with number of passagers different from any other car which has passed thru the stream before are transfered to the output stream`;

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
			distinct(({ value }) => value),
			turnToAnimatedStream({ removeAfterTime: ANIMATION_DURATION })
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
				title="distinct"
				{freeText}
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
