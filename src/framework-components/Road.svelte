<script lang="ts">
	import { BehaviorSubject, type Observable } from 'rxjs';

	export let x = 0;
	export let y = 0;
	export let width = 0;
	export let height = 0;
	export let isOneLane = false;
	export let rotation = 0;
	export let hasMark = true;
	export let closeStream: Observable<boolean> = new BehaviorSubject<false>(false).asObservable();
	export let marginTop = '0';
	export let zIndex = 0;
</script>

<div
	class="road"
	class:closed={$closeStream}
	class:one-lane={isOneLane}
	style="--road-width: {width}px; margin-top:{marginTop};z-index:{zIndex};
--road-height: {height}px;left:{x}px; top:{y}px; transform:translateX(-50%) rotate({rotation}deg)"
>
	{#if hasMark}
		<div class="operations">
			<div>Operator transformation happens here</div>
		</div>
	{/if}
	{#if !$closeStream}
		<slot name="onroad" />
	{/if}
</div>

<div class="description description-left">
	<slot name="decription-left" />
</div>

<style type="text/scss">
	.description-left {
		position: absolute;
		left: 0rem;
		top: 0rem;
	}

	.operations {
		--padding: 2rem;
		position: absolute;
		left: calc(var(--road-width) + 3.5rem);
		top: calc(-1 * var(--padding));
		display: flex;
		width: max-content;

		&:before {
			display: block;
			content: '';
			width: 3rem;
			height: 3rem;
			border: solid black;
			border-width: 0 1rem 1rem 0;
			display: inline-block;
			padding: 1rem;
			transform: rotate(135deg);
		}
	}

	.road {
		--road-bg: rgba(238, 238, 238, 1);
		--road-bg-transparent: rgba(238, 238, 238, 0);
		width: var(--road-width);
		height: var(--road-height);
		background-color: var(--road-bg);
		position: absolute;
		padding: 0 1rem;
		box-sizing: border-box;
		transform-origin: 50% 0%;
		transition: all 2s;

		&.closed {
			background-color: var(--road-bg-transparent);

			&:after,
			&:before {
				opacity: 0;
			}
		}

		&.one-lane {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		&:after {
			content: '';
			width: 0;
			height: 0;
			padding: 50%;
			border-radius: 50%;
			background-color: var(--road-bg);
			position: absolute;
			top: 0;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: -2;
			transition: opacity 1s;
		}

		&:before {
			content: '';
			width: 100%;
			height: 1px;
			background-color: #000;
			position: absolute;
			z-index: -1;
			left: 0;
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
