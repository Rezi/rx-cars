import { Observable, delay, map, mergeWith, scan, type OperatorFunction } from 'rxjs';

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

export function turnToAnimatedStream(options?: {
	removeAfterTime?: number;
	removeOnKey?: string;
	removeAfterStream?: Observable<IntervalItem>;
}) {
	return function (source: Observable<IntervalItem>) {
		let addRemoveItemsPipe: OperatorFunction<IntervalItem, IntervalItem> | undefined;
		if (options?.removeAfterTime) {
			addRemoveItemsPipe = mergeWith(
				source.pipe(
					map((item: IntervalItem, i: number) => {
						return { ...item, key: 'remove', id: 'remove' + i };
					}),
					delay(options.removeAfterTime)
				)
			);
		}

		if (options?.removeAfterStream) {
			addRemoveItemsPipe = mergeWith(options?.removeAfterStream);
		}

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

		if (addRemoveItemsPipe) {
			return source.pipe(addRemoveItemsPipe, scanPipe);
		} else {
			return source.pipe(scanPipe);
		}
	};
}
