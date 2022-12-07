import { Subscription } from 'rxjs';

export function prepareForSubscriptions(subscriptions: Subscription): Subscription {
	subscriptions?.unsubscribe();
	return new Subscription();
}
