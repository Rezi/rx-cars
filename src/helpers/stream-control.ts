import { Subscription, finalize, first } from 'rxjs';

import type { IntervalItem } from '../models/interval.model';
import { type Writable, get } from 'svelte/store';
import { getStreamWithIntervals } from './stream-factory';

export function prepareForSubscriptions(subscriptions: Subscription): Subscription {
	subscriptions?.unsubscribe();
	return new Subscription();
}

export function getResetStreamSubscription(
	carsStreamDefinitionOrLastCarDelay: IntervalItem[] | number,
	repeatStore: Writable<boolean>,
	resetDelay: number | undefined,
	resetStore: Writable<number>
) {
	let lastCarDelay: number;

	if (Array.isArray(carsStreamDefinitionOrLastCarDelay)) {
		lastCarDelay = (carsStreamDefinitionOrLastCarDelay.at(-1)?.delay || 0) + (resetDelay || 0);
	} else {
		lastCarDelay = carsStreamDefinitionOrLastCarDelay;
	}

	return getStreamWithIntervals([{ delay: lastCarDelay, key: 'reset' }])
		.pipe(
			first(),
			finalize(() => {
				const unsubscriber = repeatStore.subscribe((isRepeating) => {
					isRepeating && resetStore.set(get(resetStore) + 1);
				});

				unsubscriber();
			})
		)
		.subscribe();
}
