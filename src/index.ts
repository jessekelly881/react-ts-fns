import * as h from "react-hyperscript";
import * as tagNames from "html-tag-names";
import * as ReactDom from "react-dom";
import { _capture, reducerComponent, make, update } from "react-fp-ts";

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
    ? (...args: P) => R
    : never;

const tags = tagNames
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

const hMap = (el: typeof h) => (arr: Parameters<typeof h>[]) =>
    arr.map((o, key) => el({ key }, o));

const H = (name = "", stateObj = {}) => ({
    // @param render :: state => H
    of: render =>
        H(name, {
            ...stateObj,
            render,
        }),

    // @param initialValue :: initialValue => H
    initialState: initialState =>
        H(name, {
            ...stateObj,
            initialState,
        }),

    render: () => (...args) =>
        h(make(reducerComponent(name), stateObj), ...args),
});

module.exports = {
    h, // react-hyperscript h
    H, // Stateful component
    hMap, // generate an array of elements from an array of args
    render, // render react element to dom
    tags, // dictionary of html tag fns
};
