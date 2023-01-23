<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Road from '../framework-components/Road.svelte';
	import Cars from '../framework-components/Cars.svelte';
	import { type Observable, Subscription, delay, filter, share } from 'rxjs';

	import { getStreamWithIntervals, turnToAnimatedStream } from '../helpers/stream-factory';
	import { resetStore } from '../stores/reset-store';
	import { ANIMATION_DURATION, PASTEL_COLORS } from '../consts/consts';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import { repeatStore } from '../stores/repeat-store';
	import Description from '../framework-components/Description.svelte';
	import { getResetStreamSubscription, prepareForSubscriptions } from '../helpers/stream-control';

	export let width = 0;
	export let height = 0;

	const customEasingFn = (a: number) => a;

	const carsStreamDefinition: IntervalItem[] = [
		{ delay: 500, value: 1, key: 'car' },
		{ delay: 1000, value: 3, key: 'car' },
		{ delay: 1700, value: 2, key: 'car' },
		{ delay: 2100, value: 1, key: 'car' },
		{ delay: 2700, value: 1, key: 'car' },
		{ delay: 3100, value: 5, key: 'car' },
		{ delay: 3500, value: 1, key: 'car' },
		{ delay: 4000, value: 3, key: 'car' },
		{ delay: 5000, value: 1, key: 'car' },
		{ delay: 5500, value: 1, key: 'car' },
		{ delay: 6500, value: 2, key: 'car' }
	];

	const operatorTypeSignatures = '';

	const operatorParameters = [[]];

	const codeExamples: string[] = [
		`import { fromEvent, filter } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const clicksOnDivs = clicks.pipe(
  filter(ev => (<HTMLElement>ev.target).tagName === 'DIV')
);
clicksOnDivs.subscribe(x => console.log(x));`
	];

	const carCodeExamples: string[] = [
		`const carStream:Observble<Car> = stream;
const filtered = carStream.pipe(
  filter((car: Car) => {
    return item.passengers === 1;
  })
);`
	];

	const freeText = `Filter items emitted by the source Observable by only emitting those that satisfy a specified predicate.`;
	const exampleText = `In this example, only values (cars) with one passenger are allowed to pass to the subscriber`;

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
			filter((item: IntervalItem) => {
				return item.value === 1;
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
		/>
	</Road>

	<Road x={width / 1.5} y={-height / 2} width={roadWidth} {height} isOneLane={true}>
		<div slot="decription-left">
			<Description
				width={width / 1.5 - roadWidth / 2}
				title="filter"
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
