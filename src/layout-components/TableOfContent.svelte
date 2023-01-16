<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let filterBy = '';

	const dispatch = createEventDispatcher();
	let menus = [
		{
			groupName: 'Creation Operators',
			span: 2,

			items: [
				{ disabled: true, href: 'ajax', name: 'ajax' },
				{ disabled: true, href: 'defer', name: 'defer' },
				{ disabled: true, href: 'from', name: 'from ' },
				{ disabled: true, href: 'from-event', name: 'fromEvent ' },
				{ disabled: true, href: 'from-event-pattern', name: 'fromEventPattern ' },
				{ disabled: true, href: 'generate', name: 'generate ' },
				{ disabled: true, href: 'interval', name: 'interval ' },
				{ disabled: true, href: 'of', name: 'of' },
				{ disabled: true, href: 'range', name: 'range' },
				{ disabled: true, href: 'throw-error', name: 'throwError ' },
				{ disabled: true, href: 'timer', name: 'timer ' },
				{ disabled: true, href: 'iif', name: 'iif ' }
			]
		},
		{
			groupName: 'Join Creation Operators',
			span: 1,
			items: [
				{ disabled: true, href: 'combine-latest', name: 'combineLatest' },
				{ disabled: false, href: 'concat-with', name: 'concatWith' },
				{ disabled: true, href: 'fork-join', name: 'forkJoin' },
				{ disabled: true, href: 'merge', name: 'merge ' },
				{ disabled: true, href: 'partition', name: 'partition ' },
				{ disabled: true, href: 'race', name: 'race ' },
				{ disabled: true, href: 'zip', name: 'zip ' }
			]
		},
		{
			groupName: 'Join Operators',
			span: 1,
			items: [
				{ disabled: true, href: 'combine-latest-all', name: 'combineLatestAll ' },
				{ disabled: false, href: 'concat-all', name: 'concatAll ' },
				{ disabled: true, href: 'exhaustAll', name: 'exhaustAll ' },
				{ disabled: false, href: 'merge-all', name: 'mergeAll ' },
				{ disabled: false, href: 'switch-all', name: 'switchAll ' },
				{ disabled: true, href: 'start-with', name: 'startWith ' },
				{ disabled: true, href: 'with-latest-from', name: 'withLatestFrom ' }
			]
		},
		{
			groupName: 'Transformation Operators',
			span: 3,
			items: [
				{ disabled: false, href: 'buffer', name: 'buffer' },
				{ disabled: true, href: 'buffer-count', name: 'bufferCount' },
				{ disabled: true, href: 'buffer-time', name: 'bufferTime' },
				{ disabled: true, href: 'buffer-toggle', name: 'bufferToggle' },
				{ disabled: true, href: 'buffer-when', name: 'bufferWhen' },
				{ disabled: false, href: 'concat-map', name: 'concatMap ' },
				{ disabled: true, href: 'exhaust-map', name: 'exhaustMap ' },
				{ disabled: true, href: 'expand', name: 'expand ' },
				{ disabled: true, href: 'group-by', name: 'groupBy ' },
				{ disabled: false, href: 'map', name: 'map ' },
				{ disabled: false, href: 'merge-map', name: 'mergeMap (FlatMap)' },
				{ disabled: true, href: 'merge-scan', name: 'mergeScan' },
				{ disabled: true, href: 'pairwise', name: 'pairwise ' },
				{ disabled: true, href: 'scan', name: 'scan ' },
				{ disabled: true, href: 'switch-scan', name: 'switchScan ' },
				{ disabled: false, href: 'switch-map', name: 'switchMap ' },
				{ disabled: true, href: 'window', name: ' window' },
				{ disabled: true, href: 'window-count', name: ' windowCount' },
				{ disabled: true, href: 'window-time', name: ' windowTime' },
				{ disabled: true, href: 'window-toggle', name: ' windowToggle' },
				{ disabled: true, href: 'window-when', name: ' windowWhen' }
			]
		},
		{
			groupName: 'Filtering Operators',
			span: 3,
			items: [
				{ disabled: true, href: 'audit', name: 'audit' },
				{ disabled: true, href: 'audit-time', name: 'auditTime' },
				{ disabled: true, href: 'debounce', name: 'debounce' },
				{ disabled: false, href: 'debounce-time', name: 'debounceTime' },
				{ disabled: false, href: 'distinct', name: 'distinct' },
				{
					disabled: false,
					href: 'distinct-until-changed',
					name: 'distinctUntilChanged'
				},
				{
					disabled: false,
					href: 'distinct-until-key-changed',
					name: 'distinctUntilKeyChanged'
				},
				{ disabled: true, href: 'element-at', name: 'elementAt' },
				{ disabled: false, href: 'filter', name: 'filter' },
				{ disabled: false, href: 'first', name: 'first' },
				{ disabled: true, href: 'ignore-elements', name: 'ignoreElements' },
				{ disabled: false, href: 'last', name: 'last' },
				{ disabled: true, href: 'sample', name: 'sample' },
				{ disabled: true, href: 'sample-time', name: 'sampleTime' },
				{ disabled: true, href: 'single', name: 'single' },
				{ disabled: false, href: 'skip', name: 'skip' },
				{ disabled: true, href: 'skip-last', name: 'skipLast' },
				{ disabled: true, href: 'skip-until', name: 'skipUntil' },
				{ disabled: true, href: 'skip-while', name: 'skipWhile' },
				{ disabled: false, href: 'take', name: 'take' },
				{ disabled: true, href: 'take-last', name: 'takeLast' },
				{ disabled: false, href: 'take-until', name: 'takeUntil' },
				{ disabled: true, href: 'take-while', name: 'takeWhile' },
				{ disabled: true, href: 'throttle', name: 'throttle' },
				{ disabled: true, href: 'throttle-time', name: 'throttleTime' }
			]
		},
		{
			groupName: 'Multicasting Operators',
			span: 1,
			items: [{ disabled: true, href: 'share', name: 'share' }]
		},
		{
			groupName: 'Error Handling Operators',
			span: 1,
			items: [
				{ disabled: true, href: 'catch-error', name: 'catchError' },
				{ disabled: true, href: 'retry', name: 'retry' },
				{ disabled: true, href: 'retry-when', name: 'retryWhen' }
			]
		},
		{
			groupName: 'Utility Operators',
			span: 2,
			items: [
				{ disabled: true, href: 'tap', name: 'tap' },
				{ disabled: false, href: 'delay', name: 'delay' },
				{ disabled: true, href: 'delay-when', name: 'delayWhen' },
				{ disabled: true, href: 'dematerialize', name: 'dematerialize' },
				{ disabled: true, href: 'materialize', name: 'materialize' },
				{ disabled: true, href: 'observe-on', name: 'observeOn' },
				{ disabled: true, href: 'subscribe-on', name: 'subscribeOn' },
				{ disabled: true, href: 'timeInterval', name: 'timeInterval' },
				{ disabled: true, href: 'timestamp', name: 'timestamp' },
				{ disabled: true, href: 'timeout', name: 'timeout' },
				{ disabled: true, href: 'timeout-with', name: 'timeoutWith' },
				{ disabled: true, href: 'toArray', name: 'toArray' }
			]
		},
		{
			groupName: 'Conditional and Boolean Operators',
			span: 1,
			items: [
				{ disabled: true, href: 'default-if-empty', name: 'defaultIfEmpty' },
				{ disabled: true, href: 'every', name: 'every' },
				{ disabled: true, href: 'find', name: 'find' },
				{ disabled: true, href: 'find-index', name: 'findIndex' },
				{ disabled: true, href: 'is-empty', name: 'isEmpty' }
			]
		},
		{
			groupName: 'Mathematical and Aggregate Operators',
			span: 1,
			items: [
				{ disabled: true, href: 'count', name: 'count' },
				{ disabled: true, href: 'max', name: 'max' },
				{ disabled: true, href: 'min', name: 'min' },
				{ disabled: true, href: 'reduce', name: 'reduce' }
			]
		}
	];

	$: filteredMenus = menus
		.map((menu) => {
			const filteredItems = menu.items.filter((item) =>
				item.name.toLowerCase().includes(filterBy.toLowerCase())
			);
			return { ...menu, items: filteredItems };
		})
		.filter((menu) => menu.items.length > 0);
</script>

{#each filteredMenus as group}
	<section style="grid-row-start: span {group.span};">
		<h3>{group.groupName}</h3>
		<ul>
			{#each group.items as item}
				<li>
					<a
						class:disabled={item.disabled}
						on:click={() => {
							dispatch('close');
						}}
						href="/operators/{item.href}">{item.name}</a
					>
				</li>
			{/each}
		</ul>
	</section>
{/each}

<style type="text/scss">
	.disabled {
		color: gray !important;
		pointer-events: none;
	}
</style>
