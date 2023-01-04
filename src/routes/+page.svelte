<script lang="ts">
	import TableOfContent from '../layout-components/TableOfContent.svelte';
</script>

<header>
	<h1 class="title">ReactiveX Cars</h1>
	<h3 class="subtitle">JS Reactive streams explained by animated traffic situations</h3>
</header>

<main>
	<p class="how-to">
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos nostrum voluptatem doloribus
		expedita dolorem vero distinctio tempore neque, numquam labore odit sit delectus accusamus minus
		adipisci blanditiis dolores. Quidem, error. Voluptas ea asperiores consectetur sed voluptatum
		optio! Excepturi, in iure, fuga voluptatibus vel possimus doloremque voluptate, facere
		recusandae repudiandae mollitia consequuntur! Ratione inventore perspiciatis accusamus
		voluptates sequi quibusdam harum dolor.
	</p>

	<div class="rx-types">
		<TableOfContent />
	</div>
</main>

<style type="text/scss">
	header {
		padding: 1rem;
		margin: 0 auto;
		max-width: 80rem;

		.title {
			text-align: center;
			margin: 5rem 0rem 1rem;
		}

		.subtitle {
			text-align: center;
			margin-bottom: 5rem;
		}
	}

	main {
		padding: 1rem;
		margin: 0 auto;
		max-width: 80rem;
	}

	.rx-types {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 1rem;
	}
</style>
