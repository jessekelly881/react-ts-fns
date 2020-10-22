import * as h from "react-hyperscript";
import * as tagNames from "html-tag-names";
import * as ReactDom from "react-dom";
import {
    _capture,
    reducerComponent,
    make,
    update,
    Self,
    StateUpdate,
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
export const render = (
    e: Parameters<typeof ReactDom.render>[0],
    selector: string = "root",
) => ReactDom.render(e, document.querySelector(selector));

export const hMap = (el: typeof h) => (arr: Parameters<typeof h>[]) =>
    arr.map((o, key) => el({ key }, o));

export function H<State, Action>(name = "", stateObj = {}) {
    type HSelf = Self<{}, State, Action>;

    return {
        // @param render :: state => H
        of: (render: (x: HSelf) => typeof h) =>
            H(name, { ...stateObj, render }),

        // @param initialValue :: initialValue => H
        initialState: (initialState: State) =>
            H(name, {
                ...stateObj,
                initialState,
            }),

        reducer: (r: (s: HSelf, a: Action) => StateUpdate) => {
            const reducer = (s: HSelf, a: Action) => {
                const ret = r(s, a);
                return update(ret);
            };

            return H(name, { ...stateObj, reducer });
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
