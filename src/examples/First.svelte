<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import { type Observable, Subscription, share, delay, first, of, mergeWith } from 'rxjs';

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
		{ delay: 1000, value: 3, key: 'car' },
		{ delay: 1700, value: 2, key: 'car' },
		{ delay: 2100, value: 1, key: 'car' },
		{ delay: 2700, value: 1, key: 'car' },
		{ delay: 3100, value: 5, key: 'car' }
	];

	const operatorTypeSignatures =
		'first<T, D>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>';

	const operatorParameters = [[]];

	const codeExamples: string[] = [
		`import { fromEvent, first } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(first());
result.subscribe(x => console.log(x));`,
		`import { fromEvent, first } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(first(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
result.subscribe(x => console.log(x));`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const filtered = carStream.pipe(
  first()
);`
	];

	const freeText = `Emits only the first value (or the first value that meets some condition) emitted by the source Observable.`;
	const exampleText = `In this example, only first value (car) is passed to the output stream. After that the output stream is closed`;

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
			first(),
			turnToAnimatedStream({
				removeAfterTime: ANIMATION_DURATION
			}),
			share()
		);

		closeStream = of(false).pipe(
			mergeWith(
				of(true).pipe(delay((carsStreamDefinition.at(1)?.delay || 0) + ANIMATION_DURATION / 2))
			)
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
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="first"
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
