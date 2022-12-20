<script lang="ts">
	import type { IntervalItem } from './models/interval.model';
	import type { CarParts } from './models/parts.model';

	export let car: IntervalItem;
	export let carParts: CarParts = 'all';

	$: passengers = [...Array(car.value).keys()];
</script>

<div class="car" style="background-color:{car.color};">
	{#if ['wheels', 'all'].includes(carParts)}
		<div class="wheel w-1" />
		<div class="wheel w-2" />
		<div class="wheel w-3" />
		<div class="wheel w-4" />
	{/if}
	{#if ['value', 'all'].includes(carParts)}
		{#each passengers as passenger}
			<div class="passenger" />
		{/each}
	{/if}
</div>

<style type="text/scss">
	.car {
		--car-outline-color: #666;
		--car-color: #999;
		--car-scale: 1.5;

		width: calc(3rem * var(--car-scale));
		height: calc(6rem * var(--car-scale));
		background-color: var(--car-color);
		border: 2px solid var(--car-outline-color);
		border-radius: calc(0.5rem * var(--car-scale));
		position: relative;
		box-sizing: border-box;
		margin: 0 calc(1rem * var(--car-scale)) calc(1rem * var(--car-scale));
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.passenger {
		width: calc(1rem * var(--car-scale));
		height: calc(1rem * var(--car-scale));
		border-radius: 50%;
		margin: calc(0.5rem * var(--car-scale)) calc(0.1rem * var(--car-scale)) 0;
		background: #000;
	}
	.wheel {
		width: calc(0.5rem * var(--car-scale));
		height: calc(1rem * var(--car-scale));
		position: absolute;
		background-color: var(--car-outline-color);

		&.w-1,
		&.w-2 {
			top: calc(0.5rem * var(--car-scale));
		}

		&.w-3,
		&.w-4 {
			bottom: calc(0.5rem * var(--car-scale));
		}

		&.w-1,
		&.w-3 {
			left: calc(-0.5rem * var(--car-scale));
		}
		&.w-2,
		&.w-4 {
			right: calc(-0.5rem * var(--car-scale));
		}
	}
</style>
