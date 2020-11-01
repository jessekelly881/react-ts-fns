import { render, tags, H, hMap } from "../src/index";

const { button, div, span, br, small } = tags;

type ClickCounterAction = "inc" | "dec" | "reset";
type ClickCounterState = { count: number; error?: string };

const clickCounterReducer = (
    { count }: ClickCounterState,
    action: ClickCounterAction,
): ClickCounterState => {
    switch (action) {
        case "inc":
            return { count: count + 1 };

        case "dec":
            return {
                count: Math.max(count - 1, 0),
                error: count - 1 < 0 ? "Count cannot be negative!!" : "",
            };

        case "reset":
            return { count: 0 };
    }
};

const errorText = (error: string) => small({ style: { color: "red" } }, error);

const arrayN = (n: number) => Array.from(Array(n).keys());

const clickCounter = H<ClickCounterState, ClickCounterAction>("Counter")
    .of(({ count, error }, exec) =>
        div({}, [
            hMap(span, span({}, "Empty"))(arrayN(count)),
            br(),
            br(),
            button({ onClick: exec("inc") }, "inc"),
            button({ onClick: exec("dec") }, "dec"),
            button({ onClick: exec("reset") }, "reset"),
            br(),
            error ? errorText(error) : null,
        ]),
    )
    .addCallback(console.log)
    .initialState({ count: 0 })
    .reducer(clickCounterReducer)
    .create();

render(div({}, clickCounter()), "#root");
