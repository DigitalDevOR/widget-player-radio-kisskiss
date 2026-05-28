/**
 * coverTransition.js
 * Utility per cambiare la copertina con un crossfade semplice e stabile.
 */

const fadeTimers = new WeakMap();
const loadedImageUrls = new Set();
const loadingImagePromises = new Map();

export function setImageSrcIfChanged(imageElement, nextSrc) {
	if (!imageElement || !nextSrc) return false;

	const currentSrc = imageElement.getAttribute('src') || imageElement.currentSrc || imageElement.src || '';
	if (currentSrc === nextSrc) {
		return false;
	}

	imageElement.src = nextSrc;
	return true;
}

function preloadImage(url) {
	if (!url) return Promise.resolve();

	if (loadedImageUrls.has(url)) {
		return Promise.resolve();
	}

	if (loadingImagePromises.has(url)) {
		return loadingImagePromises.get(url);
	}

	const promise = new Promise((resolve) => {
		const image = new Image();
		image.onload = () => {
			loadedImageUrls.add(url);
			loadingImagePromises.delete(url);
			resolve();
		};
		image.onerror = () => {
			loadingImagePromises.delete(url);
			resolve();
		};
		image.src = url;
	});

	loadingImagePromises.set(url, promise);
	return promise;
}

export function setCoverImageSmoothly(coverImage, nextSrc, options = {}) {
	if (!coverImage || !nextSrc) return;

	const fadeOutMs = options.fadeOutMs ?? 180;
	const fadeInMs = options.fadeInMs ?? 220;
	const waitBeforeSwapMs = options.waitBeforeSwapMs ?? fadeOutMs;

	const currentSrc = coverImage.currentSrc || coverImage.src || '';
	if (currentSrc === nextSrc) {
		coverImage.style.opacity = '1';
		return;
	}

	const existing = fadeTimers.get(coverImage);
	if (existing) {
		clearTimeout(existing.out);
		clearTimeout(existing.swap);
		clearTimeout(existing.in);
	}

	coverImage.style.transition = `opacity ${fadeInMs}ms ease`;
	coverImage.style.opacity = '0';

	preloadImage(nextSrc).then(() => {
		const swapTimeout = setTimeout(() => {
			setImageSrcIfChanged(coverImage, nextSrc);
			coverImage.style.opacity = '1';
			loadedImageUrls.add(nextSrc);
		}, waitBeforeSwapMs);

		fadeTimers.set(coverImage, {
			out: null,
			swap: swapTimeout,
			in: null,
		});
	});
}
