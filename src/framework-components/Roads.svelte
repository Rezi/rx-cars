<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import Road from './Road.svelte';

	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { IntervalItem, IntervalItems } from '../models/interval.model';
	import type { Observable } from 'rxjs';

	export let animationDuration: number;
	export let height: number;
	export let roadWidth: number;
	export let queueRoads = true;
	export let rotations: number | number[] = -45;

	export let roadsStream: Observable<{ items: IntervalItem[] }>;
	export let easingFunction: (arg: number) => number = cubicOut;

	type CarStreamsType = { [key: string]: Observable<IntervalItems> };
	let carStreams: CarStreamsType = {};

	$: onRoadStreams($roadsStream);

	function onRoadStreams(streams: IntervalItems) {
		if (streams) {
			carStreams = $roadsStream.items.reduce((accu, item: IntervalItem) => {
				if (item.id && item.animatedSubstream) {
					accu[item.id] = item.animatedSubstream;
				}

				return accu;
			}, {} as CarStreamsType);
		}
	}
</script>

{#if $roadsStream?.items}
	{#each $roadsStream.items as road, index (road.id)}
		<div
			class="road-wrap"
			class:absolute={!queueRoads}
			style={`height:${roadWidth * 1.7}px;width:${roadWidth}px;left:${roadWidth / 2}px;`}
			animate:flip
			in:fly={{
				delay: 0,
				duration: animationDuration,
				x: 0,
				y: height,
				opacity: 1,
				easing: easingFunction
			}}
			out:fade
		>
			{#if road.value}
				<div class="transform-value" style={`width:${roadWidth}px;right:${roadWidth * 1.5}px;`}>
					Value
					<div class="dots">
						{#each [...Array(road.value).keys()] as dot}
							<div class="dot" />
						{/each}
					</div>
				</div>
			{/if}
			{#if road.id}
				<Road
					x={0}
					y={0}
					width={roadWidth}
					height={height * 1.7}
					rotation={typeof rotations === 'number' ? rotations : rotations[index]}
					hasMark={false}
					isOneLane={true}
				>
					<svelte:fragment slot="onroad"
						><slot cars={carStreams[road.id]} roadId={road.id} /></svelte:fragment
					>
				</Road>
			{/if}
		</div>
	{/each}
{/if}

<style type="text/scss">
	.road-wrap {
		display: inline-block;
		position: relative;
		margin-top: 1.4rem;
	}

	.transform-value {
		position: absolute;
		z-index: 12;
		margin-right: 1rem;

		.dots {
			margin-top: 1rem;
			display: flex;
			flex-wrap: wrap;
			padding: 1rem;
			border: 1px solid #000;
			gap: 1rem;
			.dot {
				width: 1rem;
				height: 1rem;
				border-radius: 50%;
				background-color: #000;
			}
		}
	}

	.absolute {
		position: absolute;
	}
</style>
