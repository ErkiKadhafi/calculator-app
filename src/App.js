import { useState } from "react";

function App() {
    const [expression, setExpression] = useState("");
    const [answer, setAnswer] = useState("");
    const [isCloseClosure, setIsCloseClosure] = useState(false);

    // prettier-ignore
    const calcButtons = [
      "C", "( )", "%", "/", 
      7, 8, 9, '*',
      4, 5, 6, '-',
      1, 2, 3, '+',
      '+/-', 0, '.', '='
    ]

    const lexer = (function () {
        function tokenize(input) {
            const chars = input.split("");
            const tokens = [];

            while (chars.length) {
                // Skip white space
                readWhile(chars, isWhitespace);

                if (!chars.length) {
                    break;
                }

                const ch = chars.shift();

                if (isNum(ch)) {
                    tokens.push({
                        type: "NUM",
                        val: ch + readWhile(chars, isNum),
                    });
                } else if (isOp(ch)) {
                    tokens.push({ type: "OP", val: ch });
                }
            }

            return infixToReversePolish(tokens);
        }

        function readWhile(chars, predicate) {
            let str = "";

            while (chars.length && predicate(chars[0])) {
                str += chars.shift();
            }

            return str;
        }

        function isWhitespace(ch) {
            return /[\n\t\s]/.test(ch);
        }

        function isNum(ch) {
            return /[0-9.]/.test(ch);
        }

        function isOp(ch) {
            return /[()\-+\/*^%]/.test(ch);
        }

        function infixToReversePolish(tokens) {
            const queue = [];
            const stack = [];
            const precedence = {
                "(": 10,
                "+": 20,
                "-": 20,
                "/": 30,
                "*": 30,
                "%": 30,
                "^": 40,
            };
            while (tokens.length) {
                const token = tokens.shift();
                const tkPrec = precedence[token.val] || 0;
                let stPrec = stack.length
                    ? precedence[stack[stack.length - 1].val]
                    : 0;

                if (token.type == "OP" && token.val == ")") {
                    let op = null;

                    while ((op = stack.pop()).val != "(") {
                        queue.push(op);
                    }
                } else if (token.type == "NUM") {
                    queue.push(token);
                } else if (
                    token.type == "OP" &&
                    (!stack.length || token.val == "(" || tkPrec > stPrec)
                ) {
                    stack.push(token);
                } else {
                    while (tkPrec <= stPrec) {
                        queue.push(stack.pop());
                        stPrec = stack.length
                            ? precedence[stack[stack.length - 1].val]
                            : 0;
                    }

                    stack.push(token);
                }
            }

            while (stack.length) {
                queue.push(stack.pop());
            }

            return queue;
        }
        return { tokenize };
    })();
    function evaluate(tokens) {
        const stack = [];

        while (tokens.length) {
            const token = tokens.shift();

            if (token.type == "NUM") {
                // We only care about the numbers now, not the whole token
                // so we only push the val and make sure it's a number with parseFloat()
                // We need to use parseFloat otherwise we will have trouble with
                // JavaScript's type coercion when we try to do things like (lhs + rhs)
                stack.push(parseFloat(token.val));
                continue;
            }

            // If we reach here we must be working with an operator token
            const rhs = stack.pop();
            const lhs = stack.pop();

            switch (token.val) {
                case "+":
                    stack.push(lhs + rhs);
                    break;
                case "-":
                    stack.push(lhs - rhs);
                    break;
                case "*":
                    stack.push(lhs * rhs);
                    break;
                case "/":
                    stack.push(lhs / rhs);
                    break;
                case "%":
                    stack.push(lhs % rhs);
                    break;
                case "^":
                    stack.push(Math.pow(lhs, rhs));
                    break;
            }
        }

        // Finally we pop our answer off the stack
        return stack.pop();
    }

    // console.log(tokens);
    // console.log(answer);

    const handleClick = (e) => {
        // console.log(e.target.innerHTML);
        let char = e.target.innerHTML;
        if (char === "C") {
            setExpression("");
            setAnswer("");
            return;
        }
        if (expression.length === 20) {
            alert("only 20 character max!");
            return;
        }

        if (char === "( )") {
            let newExpression = expression;
            const lastChar = newExpression[newExpression.length - 1];
            if (!isCloseClosure) {
                char = "(";
                setIsCloseClosure(true);

                // check if the last char is a number
                if (/[0-9.]/.test(lastChar)) char = "*" + char;
            } else {
                if (lastChar === "(") {
                    alert("please insert number before closing closure!");
                    return;
                }
                char = ")";
                setIsCloseClosure(false);
            }
            setExpression(expression + char);
        } else if (char === "=") {
            const tokens = lexer.tokenize(expression);
            const tempAnswer = evaluate(tokens);
            if (Number.isNaN(tempAnswer)) {
                alert("invalid format!");
                return;
            }
            setAnswer("=" + tempAnswer);
        } else {
            setExpression(expression + char);
        }
    };
    const handleDelete = (e) => {
        let newExpression = expression;

        /* ======== check so no closing closure when delete the opening one ======== */
        const lastChar = newExpression[newExpression.length - 1];
        if (lastChar === "(") setIsCloseClosure(false);

        newExpression = newExpression.slice(0, -1);
        setExpression(newExpression);
    };
    return (
        <section className="bg-black-secondary">
            <div className="layout h-screen bg-black-primary px-4">
                <div className="h-2/5 text-yellow-primary text-right text-4xl pt-16">
                    <div
                        className={`${
                            expression.length <= 15 ? "text-5xl" : "text-4xl"
                        }  h-1/2`}
                    >
                        <h1>{expression}</h1>
                    </div>
                    <div className=" h-1/4">
                        <h1>{answer}</h1>
                    </div>
                    <div className="h-1/4 flex items-end justify-end pb-4">
                        <button
                            className="cursor-pointer"
                            onClick={handleDelete}
                        >
                            <svg
                                width="39"
                                height="39"
                                viewBox="0 0 39 39"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M30.8747 8.125H15.9734C14.6809 8.12614 13.4418 8.6405 12.5284 9.555L3.72091 18.3462C3.5686 18.4973 3.44771 18.677 3.36521 18.8751C3.28271 19.0731 3.24023 19.2855 3.24023 19.5C3.24023 19.7145 3.28271 19.9269 3.36521 20.1249C3.44771 20.323 3.5686 20.5027 3.72091 20.6538L12.5284 29.445C13.4418 30.3595 14.6809 30.8739 15.9734 30.875H30.8747C32.1676 30.875 33.4076 30.3614 34.3218 29.4471C35.236 28.5329 35.7497 27.2929 35.7497 26V13C35.7497 11.7071 35.236 10.4671 34.3218 9.55285C33.4076 8.63861 32.1676 8.125 30.8747 8.125ZM32.4997 26C32.4997 26.431 32.3285 26.8443 32.0237 27.149C31.719 27.4538 31.3056 27.625 30.8747 27.625H15.9734C15.5432 27.619 15.1311 27.4507 14.8197 27.1537L7.16591 19.5L14.8197 11.8462C15.1311 11.5493 15.5432 11.381 15.9734 11.375H30.8747C31.3056 11.375 31.719 11.5462 32.0237 11.851C32.3285 12.1557 32.4997 12.569 32.4997 13V26ZM27.1534 15.0962C27.0023 14.9439 26.8226 14.8231 26.6246 14.7406C26.4266 14.6581 26.2142 14.6156 25.9997 14.6156C25.7851 14.6156 25.5727 14.6581 25.3747 14.7406C25.1767 14.8231 24.997 14.9439 24.8459 15.0962L22.7497 17.2088L20.6534 15.0962C20.3474 14.7903 19.9324 14.6184 19.4997 14.6184C19.0669 14.6184 18.6519 14.7903 18.3459 15.0962C18.0399 15.4022 17.868 15.8173 17.868 16.25C17.868 16.6827 18.0399 17.0978 18.3459 17.4038L20.4584 19.5L18.3459 21.5962C18.1936 21.7473 18.0727 21.927 17.9902 22.1251C17.9077 22.3231 17.8652 22.5355 17.8652 22.75C17.8652 22.9645 17.9077 23.1769 17.9902 23.3749C18.0727 23.573 18.1936 23.7527 18.3459 23.9038C18.497 24.0561 18.6767 24.1769 18.8747 24.2594C19.0727 24.3419 19.2851 24.3844 19.4997 24.3844C19.7142 24.3844 19.9266 24.3419 20.1246 24.2594C20.3226 24.1769 20.5023 24.0561 20.6534 23.9038L22.7497 21.7912L24.8459 23.9038C24.997 24.0561 25.1767 24.1769 25.3747 24.2594C25.5727 24.3419 25.7851 24.3844 25.9997 24.3844C26.2142 24.3844 26.4266 24.3419 26.6246 24.2594C26.8226 24.1769 27.0023 24.0561 27.1534 23.9038C27.3057 23.7527 27.4266 23.573 27.5091 23.3749C27.5916 23.1769 27.6341 22.9645 27.6341 22.75C27.6341 22.5355 27.5916 22.3231 27.5091 22.1251C27.4266 21.927 27.3057 21.7473 27.1534 21.5962L25.0409 19.5L27.1534 17.4038C27.3057 17.2527 27.4266 17.073 27.5091 16.8749C27.5916 16.6769 27.6341 16.4645 27.6341 16.25C27.6341 16.0355 27.5916 15.8231 27.5091 15.6251C27.4266 15.427 27.3057 15.2473 27.1534 15.0962Z"
                                    fill="#D59E89"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="h-3/5 border-t-2 border-black-secondary grid grid-cols-4 gap-4 pt-12 pb-10">
                    {calcButtons.map((key, index) => {
                        let btnColor = "text-yellow-primary";
                        let bgBtnColor = "bg-black-secondary";
                        if (key === "C") btnColor = "text-red-primary";
                        else if (
                            typeof key !== "number" &&
                            key !== "+/-" &&
                            key !== "." &&
                            key !== "="
                        )
                            btnColor = "text-red-secondary";
                        else if (key === "=") {
                            btnColor = "text-black-primary";
                            bgBtnColor = "bg-red-secondary";
                        }
                        return (
                            <button
                                data-value={key}
                                key={index}
                                className={`${bgBtnColor} text-3xl ${btnColor} hover:bg-black-hover cursor-pointer h-20 w-20 rounded-full flex items-center justify-center`}
                                onClick={handleClick}
                            >
                                {key}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default App;
