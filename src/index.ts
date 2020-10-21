import * as h from "react-hyperscript";
import * as tagNames from "html-tag-names";
import { DOMElement, DOMAttributes } from "react";
import { render } from "react-dom";

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
    ? (...args: P) => R
    : never;

export const tags = tagNames
    .map((tag: string) => ({
        [tag]: (...args: Parameters<OmitFirstArg<typeof h>>) => h(tag, ...args),
    }))
    .reduce(Object.assign);

type ReactEl = DOMElement<DOMAttributes<Element>, Element>;

/**
 * renderEl
 * @desc Renders a react element to a dom id.
 *
 * @param { ReactEl } e - React element to render
 * @param { string } selector  - Dom selector. E.g. "div#root"
 */
export const renderEl = (e: ReactEl, selector: string = "root") =>
    render(e, document.querySelector(selector));
