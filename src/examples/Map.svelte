<script lang="ts">
	import { onMount } from 'svelte';
	import Road from '../Road.svelte';
	import Cars from '../Cars.svelte';
	import { type Observable, Subscription, share, delay, first, finalize, map } from 'rxjs';

	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION, PASTEL_COLORS } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../Description.svelte';
	import { getResetStreamSubscription, prepareForSubscriptions } from '../helpers/stream-control';

	export let width = 0;
	export let height = 0;

	// let autoresetTimer: ReturnType<typeof setTimeout>;

	const customEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[] = [
		{ delay: 1000, value: 1, key: 'car' },
		{ delay: 3000, value: 2, key: 'car' },
		{ delay: 6000, value: 3, key: 'car' },
		{ delay: 9000, value: 4, key: 'car' },
		{ delay: 11500, value: 5, key: 'car' },
		{ delay: 13500, value: 6, key: 'car' }
	];

	const operatorTypeSignatures =
		'map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R>';

	const operatorParameters = [
		[
			'project',
			'(value: T, index: number) => R	',
			`The function to apply to each value emitted by the source Observable. The index parameter is the number i for the i-th emission that has happened since the subscription, starting from the number 0.`
		],
		[
			'thisArg',
			'any',
			`Optional. Default is undefined.
An optional argument to define what this is in the project function.`
		]
	];

	const codeExamples: string[] = [
		`import { fromEvent, map } from 'rxjs';

const clicks = fromEvent<PointerEvent>(document, 'click');
const positions = clicks.pipe(map(ev => ev.clientX));

positions.subscribe(x => console.log(x));`
	];

	const carCodeExamples: string[] = [
		/* `const carStream:Observble<Car> = stream;
const intervalStream:<Observble:TrafficLightsValue>;
const buffered = carStream.pipe(buffer(intervalStream));` */
	];

	const freeText = `Applies a given project function to each value emitted by the source Observable, and emits the resulting values as an Observable.
	
In this example, values (cars) emited in the stream are transformed to differently coloured car bodies`;

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
			map((item: IntervalItem, index: number) => {
				return { ...item, color: `#${PASTEL_COLORS[(index + 2) % 6]}` };
			}),
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
		/>
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="Map"
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
			carParts={'body'}
		/>
	</Road>
{/key}

<style>
</style>
