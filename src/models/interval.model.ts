import type { Observable } from 'rxjs';

export interface IntervalItem {
	delay: number;
	key: string;
	id?: string;
	streamIndex?: number;
	color?: string;
	value?: number;
	animatedSubstream?: Observable<IntervalItems>;
	pureSubstream?: Observable<IntervalItem>;
}

export interface IntervalItems {
	items: IntervalItem[];
}
