<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import Road from './Road.svelte';

	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { IntervalItem, IntervalItems } from './models/interval.model';
	import type { Observable } from 'rxjs';

	export let animationDuration: number;
	export let height: number;
	export let roadWidth: number;
	export let roadsStream: Observable<{ items: IntervalItem[] }>;
	export let easingFunction: (arg: number) => number = cubicOut;
	let carStreams: CarStreamsType = {};

	type CarStreamsType = { [key: string]: Observable<IntervalItems> };

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
	{#each $roadsStream.items as road (road.id)}
		<div
			class="road-wrap"
			style="height:{roadWidth * 1.7}px;width:{roadWidth}px;left:{roadWidth / 2}px;"
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
			{#if road.id}
				<Road x={0} y={0} width={roadWidth} height={height * 1.7} rotation={-45}>
					<div slot="onroad"><slot cars={carStreams[road.id]} roadId={road.id} /></div>
				</Road>
			{/if}
		</div>
	{/each}
{/if}

<style type="text/scss">
	.road-wrap {
		display: inline-block;
		position: relative;
		margin-top: 2rem;
	}
</style>
