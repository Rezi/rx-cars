<script lang="ts">
	export let x = 0;
	export let y = 0;
	export let width = 0;
	export let height = 0;
	export let isOneLane = false;
	export let rotation = 0;
	export let hasMark = true;
</script>

<div
	class="road"
	class:one-lane={isOneLane}
	style="--road-width: {width}px;
--road-height: {height}px;left:{x}px; top:{y}px; transform:translateX(-50%) rotate({rotation}deg)"
>
	<div class:operations={hasMark} />
	<slot name="onroad" />
</div>

<div class="description description-left">
	<slot name="decription-left" />
</div>

<style type="text/scss">
	.description-left {
		position: absolute;
		left: 2rem;
		top: 2rem;
	}

	.operations {
		--padding: 2rem;
		width: 3rem;
		height: 3rem;
		position: absolute;
		left: calc(var(--road-width) + 3.5rem);
		top: calc(-1 * var(--padding));

		border: solid black;
		border-width: 0 1rem 1rem 0;
		display: inline-block;
		padding: 3px;
		transform: rotate(135deg);
	}

	.road {
		border-top: 1px solid;
		width: var(--road-width);
		height: var(--road-height);
		background: #eee;
		position: absolute;
		padding: 0 1rem;
		box-sizing: border-box;
		transform-origin: 50% 0%;

		&.one-lane {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		/* &:before,
		&:after {
			top: 0;
			position: absolute;
			content: '';
			width: 4px;
			height: 100%;
			background-color: #fff;
		}

		&:before {
			left: 0.5rem;
		}

		&:after {
			right: 0.5rem;
		} */
	}
</style>
