<script lang="ts">
	import TableOfContent from '../layout-components/TableOfContent.svelte';

	let menuOpened = false;
	let filterBy = '';

	function onClosed() {
		menuOpened = false;
		setTimeout(() => {
			filterBy = '';
		}, 100);
	}
</script>

<nav class="menu" class:checked={menuOpened}>
	<button
		class="menu-button"
		on:click={() => {
			menuOpened = !menuOpened;
		}}
	>
		<div class="hamburger" /></button
	>

	<div class="content">
		<div class="search">
			<input bind:value={filterBy} type="search" placeholder="Search" />
		</div>
		<div class="list">
			<TableOfContent on:close={onClosed} {filterBy} />
		</div>
	</div>
</nav>

<style type="text/scss">
	.menu {
		--button-size: 3rem;
		--button-padding: 1rem;
		position: fixed;
		right: 0;
		top: 0;
		-webkit-transition: 0.5s ease-in-out;
		transition: 0.5s ease-in-out;

		z-index: 9;
	}

	.menu :global(a) {
		color: var(--color-white);
	}
	.menu-button {
		width: var(--button-size);
		height: var(--button-size);
		border-color: transparent;
		padding: var(--button-padding);
		box-sizing: content-box;
		border-radius: 50%;
		position: relative;
		z-index: 1;
		margin-bottom: 0;

		&:after {
			position: absolute;
			content: '';
			transform: translate(-50%, -50%);
			width: calc(8 * var(--button-padding) + 2 * var(--button-size));
			height: calc(8 * var(--button-padding) + 2 * var(--button-size));
			border-radius: 50%;
			top: 0;
			left: calc(var(--button-size) + 2 * var(--button-padding));
			background-color: var(--color-action);
			z-index: -1;
			transition: height 0.5s ease-in-out, width 0.5s ease-in-out;
		}
	}

	.menu.checked .menu-button {
		&:after {
			width: 400vh;
			height: 400vh;
		}
	}

	.hamburger {
		position: absolute;
		width: var(--button-size);
		height: 4px;
		background: var(--color-white);
		display: block;
		-webkit-transform-origin: center;
		transform-origin: center;
		-webkit-transition: 0.5s ease-in-out;
		transition: 0.5s ease-in-out;
	}

	.hamburger:after,
	.hamburger:before {
		-webkit-transition: 0.5s ease-in-out;
		transition: 0.5s ease-in-out;
		content: '';
		position: absolute;
		display: block;
		width: 100%;
		height: 100%;
		background: var(--color-white);
	}

	.hamburger:before {
		top: -1.2em;
	}

	.hamburger:after {
		bottom: -1.2em;
	}

	.menu.checked .hamburger {
		-webkit-transform: rotate(45deg);
		transform: rotate(45deg);
	}

	.menu.checked .hamburger:after {
		-webkit-transform: rotate(90deg);
		transform: rotate(90deg);
		bottom: 0;
	}

	.menu.checked .hamburger:before {
		-webkit-transform: rotate(90deg);
		transform: rotate(90deg);
		top: 0;
	}

	.menu .content {
		gap: 1rem;
		pointer-events: none;
		padding-left: 3rem;
		z-index: 2;
		position: absolute;
		top: calc(var(--button-size) + 2 * var(--button-padding));
		right: 0;
		opacity: 0;
		-webkit-transition: 0.25s 0s ease-in-out;
		transition: 0.25s 0s ease-in-out;

		color: var(--color-white);
		width: 100vw;

		.search {
			display: flex;
			align-items: center;
			position: absolute;
			top: calc(-1 * var(--button-size));

			label {
				font-size: 3rem;
				padding-right: 2rem;
				padding-bottom: 0;
			}
			input {
				background-color: var(--color-white);
				max-width: 30rem;
			}
		}

		.list {
			margin-top: 2rem;
			padding-right: 3rem;
			display: grid;
			grid-template-rows: masonry;
			grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
			height: 100vh;
			overflow-y: scroll;
			padding-bottom: calc(1 * var(--button-size) + 2 * var(--button-padding));
		}
	}
	.menu.checked .content {
		opacity: 1;
		pointer-events: initial;
	}
</style>
