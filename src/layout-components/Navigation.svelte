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

	let searchInput: HTMLInputElement;

	$: onMenuOpened(menuOpened);

	function onMenuOpened(menuOpened: boolean) {
		menuOpened && searchInput.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'KeyM' && event.ctrlKey) {
			event.stopImmediatePropagation();
			event.preventDefault();
			menuOpened = !menuOpened;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

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
			<input bind:value={filterBy} type="search" placeholder="Search" bind:this={searchInput} />
			<a
				class="home-button"
				href="/"
				on:click={() => {
					menuOpened = false;
				}}>⌂ Home</a
			>
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

		z-index: 10;

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

		:global(a) {
			color: var(--color-white);
		}

		&.checked {
			.hamburger {
				transform: rotate(45deg);
			}

			.hamburger:after {
				transform: rotate(90deg);
				bottom: 0;
			}
			.hamburger:before {
				transform: rotate(90deg);
				top: 0;
			}
			.content {
				opacity: 1;
				pointer-events: initial;
			}

			&:after {
				width: 400vh;
				height: 400vh;
			}
		}

		.content {
			pointer-events: none;
			padding-left: 3rem;
			z-index: 2;
			position: absolute;
			top: calc(var(--button-size) + 2 * var(--button-padding));
			right: 0;
			opacity: 0;
			transition: 0.25s 0.25s ease-in-out;
			color: var(--color-white);
			width: 100vw;

			.search {
				display: flex;
				align-items: center;
				position: absolute;
				top: calc(-1 * var(--button-size));

				.home-button {
					white-space: nowrap;
					padding-left: 3rem;
					font-size: 2rem;
				}

				label {
					font-size: 3rem;
					padding-right: 2rem;
					padding-bottom: 0;
				}
				input {
					background-color: var(--color-white);
					max-width: 30rem;
					margin-bottom: 0;
				}
			}

			.list {
				margin-top: 5rem;
				padding-right: 3rem;
				display: grid;
				grid-template-rows: masonry;
				grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
				height: 100vh;
				overflow-y: scroll;
				gap: 1rem;
				padding-bottom: calc(1 * var(--button-size) + 2 * var(--button-padding));
			}
		}
	}

	.menu-button {
		background-color: var(--color-action);
		width: var(--button-size);
		height: var(--button-size);
		border-color: transparent;
		padding: var(--button-padding);
		box-sizing: content-box;
		border-radius: 50%;
		position: relative;
		z-index: 1;
		margin-bottom: 0;
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

		&:after,
		&:before {
			transition: 0.5s ease-in-out;
			content: '';
			position: absolute;
			display: block;
			width: 100%;
			height: 100%;
			background: var(--color-white);
		}

		&:before {
			top: -1em;
		}

		&:after {
			bottom: -1em;
		}
	}
</style>
