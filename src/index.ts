import h from "react-hyperscript";
import tagNames from "html-tag-names";
import ReactDom from "react-dom";
import {
    _capture,
    reducerComponent,
    make,
    updateAndSideEffects,
    Self,
} from "react-fp-ts";

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
    ? (...args: P) => R
    : never;

type HtmlTagArgs = Parameters<OmitFirstArg<typeof h>> | [];
type HtmlTagArg = HtmlTagArgs[0] | HtmlTagArgs[1];
type HtmlTagFn = (...args: HtmlTagArgs) => ReturnType<typeof h>;

export const tags = tagNames
    .map((tag: string) => ({
        [tag]: (...args: HtmlTagArgs) => h(tag, ...args),
    }))
    .reduce((x, a) => Object.assign({}, a, x));

/**
 * render
 * @desc Renders a react element to the dom using a given selector.
 *
 * @param { ReactEl } e - React element to render
 * @param { string } selector  - Dom selector. E.g. "div#root"
 */
export const render = (e: ReturnType<typeof h>, selector: string = "root") =>
    ReactDom.render(e, document.querySelector(selector));

export const hMap = (
    el: HtmlTagFn,
    emptyEl: ReturnType<typeof h> | null = null,
) => (arr: HtmlTagArg[]) =>
    arr.length === 0
        ? emptyEl
        : arr.map((o: HtmlTagArg, key) => el({ key }, o));

export function H<HState, HAction>(name = "", stateObj = {}) {
    type HSelf = Self<{}, HState, HAction>;
    type HExec = (a: HAction) => void;
    type HReducer = (s: HState, a: HAction) => HState;
    type HCallback = (s: HState) => void;

    return {
        // @param render :: state => H
        of: (r: (state: HState, exec: HExec) => ReturnType<typeof h>) => {
            const render = (self: HSelf): ReturnType<typeof h> => {
                const exec: HExec = (action: HAction) => _capture(self, action);

                return r(self.state, exec);
            };

            return H<HState, HAction>(name, { ...stateObj, render });
        },

        // @param initialValue :: initialValue => H
        initialState: (initialState: HState) =>
            H<HState, HAction>(name, {
                ...stateObj,
                initialState,
            }),

        reducer: (r: HReducer) => {
            const reducer = (p: HSelf, a: HAction) => {
                const state = p.state;
                return updateAndSideEffects(r(state, a), () =>
                    stateObj.callbacks
                        ? stateObj.callbacks.map((c: HCallback) => c(state))
                        : null,
                );
            };

            return H<HState, HAction>(name, { ...stateObj, reducer });
        },

        addCallback: (c: HCallback) => {
            const callbacks = stateObj.callbacks
                ? [...stateObj.callbacks, c]
                : [c];
            return H<HState, HAction>(name, {
                ...stateObj,
                callbacks,
            });
        },

        create: () => () => h(make(reducerComponent(name), stateObj)),
    };
}
