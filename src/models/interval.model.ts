import type { Observable } from 'rxjs';

export interface IntervalItem {
	delay: number;
	key: string;
	id?: string;
	complexId?: string;
	streamIndex?: number;
	color?: string;
	value?: number;
	animatedSubstream?: Observable<IntervalItems>;
	pureSubstream?: Observable<IntervalItem>;
	transformValue?: number;
}

export interface IntervalItems {
	items: IntervalItem[];
}
