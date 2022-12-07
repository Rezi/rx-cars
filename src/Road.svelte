<script lang="ts">
	export let x = 0;
	export let y = 0;
	export let width = 0;
	export let height = 0;
	export let isOneLane = false;
	export let rotation = 0;
</script>

<div
	class="road"
	class:one-lane={isOneLane}
	style="--road-width: {width}px;
--road-height: {height}px;left:{x}px; top:{y}px; transform:translateX(-50%) rotate({rotation}deg)"
>
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

	.road {
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
