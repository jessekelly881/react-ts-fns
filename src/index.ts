import * as h from "react-hyperscript";
import * as tagNames from "html-tag-names";
import * as ReactDom from "react-dom";
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

export const tags = tagNames
    .map((tag: string) => ({
        [tag]: (...args: Parameters<OmitFirstArg<typeof h>>) => h(tag, ...args),
    }))
    .reduce(Object.assign);

/**
 * render
 * @desc Renders a react element to the dom using a given selector.
 *
 * @param { ReactEl } e - React element to render
 * @param { string } selector  - Dom selector. E.g. "div#root"
 */
export const render = (e: ReturnType<typeof h>, selector: string = "root") =>
    ReactDom.render(e, document.querySelector(selector));

export const hMap = (el: typeof h) => (arr: Parameters<typeof h>[]) =>
    arr.map((o, key) => el({ key }, o));

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

            return H(name, { ...stateObj, render });
        },

        // @param initialValue :: initialValue => H
        initialState: (initialState: HState) =>
            H(name, {
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

            return H(name, { ...stateObj, reducer });
        },

        addCallback: (c: HCallback) => {
            const callbacks = stateObj.callbacks
                ? [...stateObj.callbacks, c]
                : [c];
            return H(name, {
                ...stateObj,
                callbacks,
            });
        },

        create: () => () => h(make(reducerComponent(name), stateObj)),
    };
}

module.exports = {
    h, // react-hyperscript h
    H, // Stateful component
    hMap, // generate an array of elements from an array of args
    render, // render react element to dom
    tags, // dictionary of html tag fns
};
