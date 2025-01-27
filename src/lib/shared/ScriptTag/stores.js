/*
 * Keep a list of script dependency URLs to load as a Set of unique strings.
 */
import { writable } from "svelte/store";

export const scriptDependencies = writable([]);
