import React, {
    createElement,
    Fragment,
    Attributes,
    FunctionComponent,
    ComponentClass,
    ReactNode,
} from "react";
import tagNames from "html-tag-names";

type El = FunctionComponent | ComponentClass | string;
type Props = Attributes | null;
type Children = ReactNode[];

interface GeneratorConfig {
    propsTransform: (props: Props) => Props;
}

const defaultConfig = {
    propsTransform: (p: Props) => p,
};

const elGenerator = (config: Partial<GeneratorConfig> = {}) => {
    const { propsTransform } = { ...defaultConfig, ...config };

    const h_ = (el: El) => (p?: Props, ...c: Children) => {
        const props = propsTransform(p);
        return createElement.apply(React, [el, props, ...c]);
    };

    const h = h_;

    const tags_ = tagNames
        .map((tag: string) => ({ [tag]: h(tag) })) // Maps each tag, e.g. a to {a: h("a")}
        .reduce((x, a) => Object.assign({}, a, x)); // Takes each mapped value and reduces it to a single object

    const tags = Object.assign(tags_, { _: h(Fragment) }); // Adds React.Fragment as _

    return { h, tags };
};

const { h, tags } = elGenerator();

export { h, tags, elGenerator };
