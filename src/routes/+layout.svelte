<script lang="ts">
	import Navigation from '../layout-components/Navigation.svelte';
</script>

<div class="global">
	<Navigation />

	<slot />
</div>

<style type="text/scss">
	:global {
		:root {
			--color-active: #af004f;
			--color-action: #750035;
			--color-base: #606c76;
			--color-border: #d1d1d1;
			--color-white: #fff;
			--color-bg: #f4f5f6;
			--color-bg-opacity: rgba(230, 230, 230, 0.5);
			--color-bg-table: #e1e1e1;
		}
		*,
		*:after,
		*:before {
			box-sizing: inherit;
		}

		html {
			box-sizing: border-box;

			font-size: 8px;
		}

		@media screen and (min-width: 320px) {
			html {
				font-size: calc(8px + 2 * ((100vw - 320px) / 960));
			}
		}

		@media screen and (min-width: 1280px) {
			html {
				font-size: calc(10px + 50 * ((100vw - 1280px) / 10000));
			}
		}

		@media screen and (min-width: 11280px) {
			html {
				font-size: 60px;
			}
		}

		body {
			margin: 0;
			color: var(--color-base);
			font-family: 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
			font-size: 1.6em;
			font-weight: 300;
			letter-spacing: 0.01em;
			line-height: 1.6;
			overflow-x: hidden;
		}

		blockquote {
			border-left: 0.3rem solid var(--color-border);
			margin-left: 0;
			margin-right: 0;
			padding: 1rem 1.5rem;
		}

		blockquote *:last-child {
			margin-bottom: 0;
		}

		.button,
		button,
		input[type='button'],
		input[type='reset'],
		input[type='submit'] {
			background-color: var(--color-active);
			border: 0.1rem solid var(--color-active);
			border-radius: 0.4rem;
			color: var(--color-white);
			cursor: pointer;
			display: inline-block;
			font-size: 1.1rem;
			font-weight: 700;
			height: 3.8rem;
			letter-spacing: 0.1rem;
			line-height: 3.8rem;
			padding: 0 3rem;
			text-align: center;
			text-decoration: none;
			text-transform: uppercase;
			white-space: nowrap;
		}

		.button:hover,
		button:hover,
		.button:focus,
		button:focus,
		input[type='button']:focus,
		input[type='button']:hover,
		input[type='reset']:focus,
		input[type='reset']:hover,
		input[type='submit']:focus,
		input[type='submit']:hover {
			background-color: var(--color-action);
			border-color: var(--color-action);
			color: var(--color-white);
			outline: 0;
		}

		.button[disabled],
		button[disabled],
		input[type='button'][disabled],
		input[type='reset'][disabled],
		input[type='submit'][disabled] {
			cursor: default;
			opacity: 0.5;
		}

		.button[disabled]:focus,
		.button[disabled]:hover,
		button[disabled]:focus,
		button[disabled]:hover,
		input[type='button'][disabled]:focus,
		input[type='button'][disabled]:hover,
		input[type='reset'][disabled]:focus,
		input[type='reset'][disabled]:hover,
		input[type='submit'][disabled]:focus,
		input[type='submit'][disabled]:hover {
			background-color: var(--color-active);
			border-color: var(--color-active);
		}

		.button.button-outline,
		button.button-outline,
		input[type='button'].button-outline,
		input[type='reset'].button-outline,
		input[type='submit'].button-outline {
			background-color: transparent;
			color: var(--color-active);
		}

		.button.button-outline:focus,
		.button.button-outline:hover,
		button.button-outline:focus,
		button.button-outline:hover,
		input[type='button'].button-outline:focus,
		input[type='button'].button-outline:hover,
		input[type='reset'].button-outline:focus,
		input[type='reset'].button-outline:hover,
		input[type='submit'].button-outline:focus,
		input[type='submit'].button-outline:hover {
			background-color: transparent;
			border-color: var(--color-base);
			color: var(--color-base);
		}

		.button.button-outline[disabled]:focus,
		.button.button-outline[disabled]:hover,
		button.button-outline[disabled]:focus,
		button.button-outline[disabled]:hover,
		input[type='button'].button-outline[disabled]:focus,
		input[type='button'].button-outline[disabled]:hover,
		input[type='reset'].button-outline[disabled]:focus,
		input[type='reset'].button-outline[disabled]:hover,
		input[type='submit'].button-outline[disabled]:focus,
		input[type='submit'].button-outline[disabled]:hover {
			border-color: inherit;
			color: var(--color-active);
		}

		.button.button-clear,
		button.button-clear,
		input[type='button'].button-clear,
		input[type='reset'].button-clear,
		input[type='submit'].button-clear {
			background-color: transparent;
			border-color: transparent;
			color: var(--color-active);
		}

		.button.button-clear:focus,
		.button.button-clear:hover,
		button.button-clear:focus,
		button.button-clear:hover,
		input[type='button'].button-clear:focus,
		input[type='button'].button-clear:hover,
		input[type='reset'].button-clear:focus,
		input[type='reset'].button-clear:hover,
		input[type='submit'].button-clear:focus,
		input[type='submit'].button-clear:hover {
			background-color: transparent;
			border-color: transparent;
			color: var(--color-base);
		}

		.button.button-clear[disabled]:focus,
		.button.button-clear[disabled]:hover,
		button.button-clear[disabled]:focus,
		button.button-clear[disabled]:hover,
		input[type='button'].button-clear[disabled]:focus,
		input[type='button'].button-clear[disabled]:hover,
		input[type='reset'].button-clear[disabled]:focus,
		input[type='reset'].button-clear[disabled]:hover,
		input[type='submit'].button-clear[disabled]:focus,
		input[type='submit'].button-clear[disabled]:hover {
			color: var(--color-active);
		}

		code {
			background: var(--color-bg);
			border-radius: 0.4rem;
			font-size: 86%;
			margin: 0 0.2rem;
			padding: 0.2rem 0.5rem;
			white-space: nowrap;
		}

		pre {
			background: var(--color-bg-opacity);
			border-left: 0.3rem solid var(--color-active);
			overflow-y: hidden;
		}

		pre > code {
			border-radius: 0;
			display: block;
			padding: 1rem 1.5rem;
			white-space: pre;
		}

		hr {
			border: 0;
			border-top: 0.1rem solid var(--color-bg);
			margin: 3rem 0;
		}

		input[type='color'],
		input[type='date'],
		input[type='datetime'],
		input[type='datetime-local'],
		input[type='email'],
		input[type='month'],
		input[type='number'],
		input[type='password'],
		input[type='search'],
		input[type='tel'],
		input[type='text'],
		input[type='url'],
		input[type='week'],
		input:not([type]),
		textarea,
		select {
			-webkit-appearance: none;
			background-color: transparent;
			border: 0.1rem solid var(--color-border);
			border-radius: 0.4rem;
			box-shadow: none;
			box-sizing: inherit;
			height: 3.8rem;
			padding: 0.6rem 1rem 0.7rem;
			width: 100%;
		}

		input[type='color']:focus,
		input[type='date']:focus,
		input[type='datetime']:focus,
		input[type='datetime-local']:focus,
		input[type='email']:focus,
		input[type='month']:focus,
		input[type='number']:focus,
		input[type='password']:focus,
		input[type='search']:focus,
		input[type='tel']:focus,
		input[type='text']:focus,
		input[type='url']:focus,
		input[type='week']:focus,
		input:not([type]):focus,
		textarea:focus,
		select:focus {
			border-color: var(--color-active);
			outline: 0;
		}

		select {
			background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 8" width="30"><path fill="%23d1d1d1" d="M0,0l6,8l6-8"/></svg>')
				center right no-repeat;
			padding-right: 3rem;
		}

		select:focus {
			background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 8" width="30"><path fill="%239b4dca" d="M0,0l6,8l6-8"/></svg>');
		}

		select[multiple] {
			background: none;
			height: auto;
		}

		textarea {
			min-height: 6.5rem;
		}

		label,
		legend {
			display: block;
			font-size: 1.6rem;
			font-weight: 700;
			margin-bottom: 0.5rem;
		}

		fieldset {
			border-width: 0;
			padding: 0;
		}

		input[type='checkbox'],
		input[type='radio'] {
			display: inline;
		}

		.label-inline {
			display: inline-block;
			font-weight: normal;
			margin-left: 0.5rem;
		}

		a {
			color: var(--color-active);
			text-decoration: none;
		}

		a:focus,
		a:hover {
			color: var(--color-base);
		}

		dl,
		ol,
		ul {
			list-style: none;
			margin-top: 0;
			padding-left: 0;
		}

		dl dl,
		dl ol,
		dl ul,
		ol dl,
		ol ol,
		ol ul,
		ul dl,
		ul ol,
		ul ul {
			font-size: 90%;
			margin: 1.5rem 0 1.5rem 3rem;
		}

		ol {
			list-style: decimal inside;
		}

		ul {
			list-style: circle inside;
		}

		.button,
		button,
		dd,
		dt,
		li {
			margin-bottom: 0.5rem;
		}

		fieldset,
		input,
		select,
		textarea {
			margin-bottom: 1.5rem;
		}

		blockquote,
		dl,
		figure,
		form,
		ol,
		p,
		pre,
		table,
		ul {
			margin-bottom: 2.5rem;
		}

		table {
			border-spacing: 0;
			display: block;
			overflow-x: auto;
			text-align: left;
			width: 100%;
		}

		td,
		th {
			border-bottom: 0.1rem solid var(--color-bg-table);
			padding: 1.2rem 1.5rem;
		}

		td:first-child,
		th:first-child {
			padding-left: 0;
		}

		td:last-child,
		th:last-child {
			padding-right: 0;
		}

		@media (min-width: 40rem) {
			table {
				display: table;
				overflow-x: initial;
			}
		}

		b,
		strong {
			font-weight: bold;
		}

		p {
			margin-top: 0;
		}

		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			font-weight: 300;
			letter-spacing: 0.1rem;
			margin-bottom: 2rem;
			margin-top: 0;
		}

		h1 {
			font-size: 4.6rem;
			line-height: 1.2;
		}

		h2 {
			font-size: 3.6rem;
			line-height: 1.25;
		}

		h3 {
			font-size: 2.8rem;
			line-height: 1.3;
		}

		h4 {
			font-size: 2.2rem;
			letter-spacing: -0.08rem;
			line-height: 1.35;
		}

		h5 {
			font-size: 1.8rem;
			letter-spacing: -0.05rem;
			line-height: 1.5;
		}

		h6 {
			font-size: 1.6rem;
			letter-spacing: 0;
			line-height: 1.4;
		}

		img {
			max-width: 100%;
		}

		.clearfix:after {
			clear: both;
			content: ' ';
			display: table;
		}

		.float-left {
			float: left;
		}

		.float-right {
			float: right;
		}
	}
	/*# sourceMappingURL=milligram.css.map */
</style>
