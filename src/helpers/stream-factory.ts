import {
	Observable,
	delay,
	map,
	mergeWith,
	of,
	scan,
	type OperatorFunction,
	share,
	mergeMap,
	from,
	withLatestFrom,
	combineLatest
} from 'rxjs';

import type { IntervalItem, IntervalItems } from '../models/interval.model';
import { PASTEL_COLORS } from '../consts/consts';

let IdPrefix = 0;

export function addIndexes<T extends IntervalItem>(intervals: T[], streamIndex?: number): T[] {
	IdPrefix++;

	return intervals.map((interval, index) => {
		const intervalCopy = { ...interval };
		intervalCopy['id'] = `${IdPrefix}_${index}`;
		intervalCopy['color'] = `#${PASTEL_COLORS[index % 6]}`;

		if (streamIndex !== undefined) {
			intervalCopy['streamIndex'] = streamIndex;
		}

		return intervalCopy;
	});
}

export function getStreamWithIntervals<T extends IntervalItem>(
	intervals: T[],
	streamIndex?: number
): Observable<T> {
	intervals = addIndexes(intervals, streamIndex);

	return new Observable((observer) => {
		intervals.forEach((interval) => {
			setTimeout(() => {
				observer.next(interval);
			}, interval.delay);
		});
	});
}

export function ungroupStreamOfItems() {
	return function (source: Observable<IntervalItem | IntervalItem[]>): Observable<IntervalItem> {
		return source.pipe(
			mergeMap((item: IntervalItem | IntervalItem[]) => {
				if (Array.isArray(item)) {
					return from(item);
				} else {
					return of(item);
				}
			})
		);
	};
}

export function getPassedCarsIds(carsOutputStream: Observable<IntervalItems>) {
	return carsOutputStream.pipe(
		scan((accu, cur) => {
			const currentIds = cur.items
				.map((item) => item.id)
				.filter((item) => typeof item === 'string') as string[];
			const merged: string[] = [...accu, ...currentIds];
			return [...new Set(merged)];
		}, [] as string[]),
		share()
	);
}

export function turnToAnimatedStream(options?: {
	removeAfterTime?: number;
	removeOnKey?: string;
	removeAfterStream?: Observable<IntervalItem>;
	closeAfterTime?: number;
	removeByIds?: Observable<string[]>;
}) {
	return function (source: Observable<IntervalItem>) {
		const streamsToMergeWith: Observable<IntervalItem>[] = [];
		if (options?.closeAfterTime) {
			streamsToMergeWith.push(
				of({ key: 'close', id: 'close', delay: options.closeAfterTime }).pipe(
					delay(options.closeAfterTime),
					share()
				)
			);
		}
		if (options?.removeAfterTime) {
			streamsToMergeWith.push(
				source.pipe(
					map((item: IntervalItem, i: number) => {
						return { ...item, key: 'remove', id: 'remove' + i };
					}),
					delay(options.removeAfterTime)
				)
			);
		}

		if (options?.removeAfterStream) {
			streamsToMergeWith.push(options?.removeAfterStream);
		}

		const addRemoveItemsPipe: OperatorFunction<IntervalItem, IntervalItem> | undefined = mergeWith(
			...streamsToMergeWith
		);

		const removeOnKey = options?.removeOnKey || 'remove';

		const scanPipe = scan(
			(acc: IntervalItems, cur: IntervalItem) => {
				if (cur.key === removeOnKey) {
					acc.items = acc.items.filter((item) => {
						return item.delay > cur.delay;
					});
				} else {
					acc.items.push(cur);
				}

				return acc;
			},
			{ items: [] as IntervalItem[] }
		);

		const removeByIdPipe = mergeMap((items: IntervalItems) => {
			if (options?.removeByIds) {
				return combineLatest([of(items), options.removeByIds]).pipe(
					map((data: [IntervalItems, string[]]) => {
						const [packOfItems, itemIds] = data;
						const filteredStreamItems = packOfItems.items.filter((streamItem: IntervalItem) => {
							return !(streamItem.id && itemIds.includes(streamItem.id));
						});
						return { ...packOfItems, items: filteredStreamItems };
					})
				);
			} else {
				return of(items);
			}
		});

		return source.pipe(addRemoveItemsPipe, scanPipe, removeByIdPipe);
	};
}

export function turnGroupsToAnimatedStream(options?: {
	removeAfterTime?: number;
	removeOnKey?: string;
}): (source: Observable<IntervalItem | IntervalItem[]>) => Observable<IntervalItems> {
	return function (source: Observable<IntervalItem | IntervalItem[]>) {
		const streamsToMergeWith: Observable<IntervalItem>[] = [];

		if (options?.removeAfterTime) {
			streamsToMergeWith.push(
				source.pipe(
					map((item: IntervalItem[] | IntervalItem, i: number) => {
						if (Array.isArray(item)) {
							return { ...item[item.length - 1], key: 'remove', id: 'remove' + i };
						} else {
							return { ...item, key: 'remove', id: 'remove' + i };
						}
					}),
					delay(options.removeAfterTime)
				)
			);
		}

		const addRemoveItemsPipe:
			| OperatorFunction<IntervalItem | IntervalItem[], IntervalItem | IntervalItem[]>
			| undefined = mergeWith(...streamsToMergeWith);

		const removeOnKey = options?.removeOnKey || 'remove';

		const scanPipe = scan(
			(acc: IntervalItems, cur: IntervalItem[] | IntervalItem) => {
				if (Array.isArray(cur)) {
					const delays = cur.map((item) => item.delay);
					const higherDelay = Math.max(...delays);

					acc.items.push(
						...cur.map((item) => {
							return { ...item, delay: higherDelay };
						})
					);
				} else {
					if (cur.key === removeOnKey) {
						acc.items = acc.items.filter((item) => {
							return item.delay > cur.delay;
						});
					} else {
						acc.items.push(cur);
					}
				}

				return acc;
			},
			{ items: [] as IntervalItem[] }
		);

		if (addRemoveItemsPipe) {
			return source.pipe(addRemoveItemsPipe, scanPipe);
		} else {
			return source.pipe(scanPipe);
		}
	};
}
