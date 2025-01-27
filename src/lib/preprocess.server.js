/**
 * Transform props (like convert scoopids to urls) before they are passed to components.
 */
import { preprocess as init } from '$lib/shared/middleware/data.server.js';

import ad from '$lib/freebird/Paid/preprocess.server.js';
import alert from '$lib/freebird/Alert/preprocess.server.js';
import article from '$lib/freebird/Article/preprocess.server.js';
import header from '$lib/freebird/Header/preprocess.server.js';
import lorem from '$lib/freebird/Lorem/preprocess.server.js';
import relatedlinks from '$lib/freebird/RelatedLinks/preprocess.server.js';
import scrollingparty from '$lib/freebird/ScrollingParty/preprocess.server.js';
import scrollingslides from '$lib/freebird/ScrollingSlides/preprocess.server.js';
import section from '$lib/freebird/Section/preprocess.server.js';
import subhed from '$lib/freebird/Subhed/preprocess.server.js';
import svelte from '$lib/freebird/Svelte/preprocess.server.js';
import text from '$lib/freebird/Text/preprocess.server.js';
import video from '$lib/freebird/Video/preprocess.server.js';

/**
 * This function preprocesses component data.
 * For instance, it converts scoop ids into usable data.
 */
export const preprocess = init({
	scrollingslides,
	ad,
	header,
	section,
	subhed,
	text,
	lorem,
	scrollingparty,
	wayfinder: scrollingparty,
	relatedlinks,
	alert,
	svelte,
	extendedbyline: header,
	article,
	video
});
