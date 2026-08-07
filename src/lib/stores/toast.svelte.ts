export interface ToastMessage {
	id: string;
	tone: 'success' | 'error' | 'info';
	text: string;
}

class ToastStore {
	messages = $state<ToastMessage[]>([]);

	push(tone: ToastMessage['tone'], text: string, durationMs = 4000) {
		const id = crypto.randomUUID();
		this.messages.push({ id, tone, text });
		setTimeout(() => this.dismiss(id), durationMs);
	}

	dismiss(id: string) {
		this.messages = this.messages.filter((m) => m.id !== id);
	}
}

export const toastStore = new ToastStore();
